// 清读 Reader：Readability 提取正文 → DOMPurify 净化 → 渲染到 Shadow DOM 遮罩层。
// 由 background.js 注入；同一页面再次注入时只调用 window.__readerMode.toggle()。
(() => {
  const api = globalThis.browser ?? chrome; // Firefox 用 browser，Chrome 用 chrome
  const STORAGE_KEY = "readerSettings";
  const DEFAULTS = { fontSize: 19, width: 720, lineHeight: 1.8, font: "sans", theme: "auto" };
  const RANGES = {
    fontSize: { min: 14, max: 28, step: 1 },
    width: { min: 480, max: 1040, step: 40 },
    lineHeight: { min: 1.4, max: 2.2, step: 0.1 },
  };
  const t = (key, ...subs) => api.i18n.getMessage(key, subs);
  const THEMES = { auto: t("themeAuto"), light: t("themeLight"), sepia: t("themeSepia"), dark: t("themeDark") };
  const FONTS = { sans: t("fontSans"), serif: t("fontSerif") };

  const STYLES = `
:host { all: initial; }
.rm {
  --sans: system-ui, -apple-system, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Noto Sans SC", "Source Han Sans SC", "Microsoft YaHei", sans-serif;
  --serif: Georgia, "Noto Serif CJK SC", "Noto Serif SC", "Source Han Serif SC", "Han Serif", "Songti SC", "STSong", "SimSun", serif;
  --mono: ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, "Noto Sans Mono CJK SC", monospace;
  --bg: #fbfbf9; --fg: #1f2328; --muted: #6b6f76; --link: #1a5fb4; --border: #e4e4de; --soft: #f0f0ea; --bar: rgba(251,251,249,.88);
  position: absolute; inset: 0; overflow-y: auto; overscroll-behavior: contain; outline: none;
  background: var(--bg); color: var(--fg); color-scheme: light;
  -webkit-font-smoothing: antialiased;
}
.rm[data-theme="sepia"] { --bg: #f4ecd8; --fg: #3b3022; --muted: #7b6a52; --link: #8a4b14; --border: #e0d3b6; --soft: #ebe0c5; --bar: rgba(244,236,216,.88); }
.rm[data-theme="dark"] { --bg: #18191b; --fg: #d9d7d1; --muted: #8d8f94; --link: #8ab4f8; --border: #2e3033; --soft: #24262a; --bar: rgba(24,25,27,.88); color-scheme: dark; }
@media (prefers-color-scheme: dark) {
  .rm[data-theme="auto"] { --bg: #18191b; --fg: #d9d7d1; --muted: #8d8f94; --link: #8ab4f8; --border: #2e3033; --soft: #24262a; --bar: rgba(24,25,27,.88); color-scheme: dark; }
}

.bar {
  position: sticky; top: 0; z-index: 1;
  display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 2px;
  padding: 6px 12px; background: var(--bar); backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border);
  font: 13px/1.4 var(--sans); color: var(--fg);
  transition: transform .2s ease;
}
.bar.hide { transform: translateY(-100%); }
.bar button { all: unset; cursor: pointer; padding: 4px 9px; border-radius: 6px; }
.bar button:hover { background: var(--soft); }
.bar button:focus-visible { outline: 2px solid var(--link); }
.bar .val { min-width: 3em; text-align: center; color: var(--muted); font-variant-numeric: tabular-nums; }
.bar .sep { width: 1px; height: 16px; background: var(--border); margin: 0 6px; }

.rm-page {
  max-width: var(--w); margin: 0 auto; padding: 48px 24px 120px;
  font-family: var(--ff); font-size: var(--fs); line-height: var(--lh);
}
.meta { color: var(--muted); font-size: .78em; }
.title { font-size: 1.85em; line-height: 1.3; font-weight: 700; margin: .25em 0 1em; }
.foot { margin-top: 3em; padding-top: 1em; border-top: 1px solid var(--border); color: var(--muted); font-size: .8em; }

.content { overflow-wrap: break-word; text-autospace: normal; }
.content p { margin: 0 0 1em; }
.content h1, .content h2 { font-size: 1.4em; line-height: 1.35; margin: 1.6em 0 .6em; }
.content h3 { font-size: 1.2em; line-height: 1.4; margin: 1.5em 0 .5em; }
.content h4, .content h5, .content h6 { font-size: 1em; margin: 1.4em 0 .4em; }
.content a, .foot a { color: var(--link); text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: .15em; }
.content img, .content video, .content svg { max-width: 100%; height: auto; }
.content figure { margin: 1.4em 0; }
.content figure img, .content p > img:only-child { display: block; margin: 0 auto; border-radius: 4px; }
.content figcaption { margin-top: .5em; font-size: .82em; color: var(--muted); text-align: center; }
.content blockquote { margin: 1.2em 0; padding: .1em 0 .1em 1em; border-left: 3px solid var(--border); color: var(--muted); }
.content ul, .content ol { padding-left: 1.6em; margin: 0 0 1em; }
.content li { margin: .3em 0; }
.content pre { overflow-x: auto; padding: .9em 1em; background: var(--soft); border-radius: 6px; font-size: .84em; line-height: 1.55; }
.content code { font-family: var(--mono); font-size: .88em; font-variant-ligatures: none; }
.content :not(pre) > code { background: var(--soft); padding: .1em .35em; border-radius: 4px; }
.content pre code { font-size: 1em; }
.content blockquote pre { color: var(--fg); }
.content table { display: block; overflow-x: auto; border-collapse: collapse; margin: 1.2em 0; font-size: .9em; }
.content th, .content td { border: 1px solid var(--border); padding: .4em .7em; text-align: left; min-width: 4em; }
.content hr { border: 0; border-top: 1px solid var(--border); margin: 2em 0; }

.toast {
  position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
  padding: 10px 16px; border-radius: 8px; background: #222; color: #fff;
  font: 14px/1.4 system-ui, sans-serif; box-shadow: 0 6px 24px rgba(0,0,0,.25);
}`;

  let settings = { ...DEFAULTS };
  let host = null;
  let root = null;
  let prevOverflow = "";
  let prevFocus = null;
  let opening = null;
  let saveTimer = 0;

  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A" && node.hasAttribute("href") && !isSamePageAnchor(node)) {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
    }
  });

  function isSamePageAnchor(a) {
    const href = a.getAttribute("href");
    if (href.startsWith("#")) return true;
    try {
      const u = new URL(href, location.href);
      return !!u.hash && u.origin + u.pathname + u.search === location.origin + location.pathname + location.search;
    } catch {
      return false;
    }
  }

  function readingMinutes(text) {
    const cjk = (text.match(/[぀-ヿ㐀-鿿豈-﫿가-힯]/g) || []).length;
    const words = (text.replace(/[぀-ヿ㐀-鿿豈-﫿가-힯]/g, " ").match(/[A-Za-z0-9]+/g) || []).length;
    return Math.max(1, Math.round(cjk / 400 + words / 230));
  }

  function makeHost(html) {
    // 用 div 而不是自定义元素：页面可以抢先 customElements.define 同名元素拿到 shadow root
    const el = document.createElement("div");
    // 内联 !important，防止页面样式影响宿主元素
    const hostStyle = {
      position: "fixed", inset: "0", "z-index": "2147483647", display: "block", margin: "0",
      opacity: "1", visibility: "visible", transform: "none", filter: "none", "clip-path": "none",
    };
    for (const [k, v] of Object.entries(hostStyle)) el.style.setProperty(k, v, "important");
    const shadow = el.attachShadow({ mode: "closed" });
    shadow.innerHTML = `<style>${STYLES}</style>${html}`;
    return { el, shadow };
  }

  function toast(msg) {
    const { el, shadow } = makeHost(`<div class="toast"></div>`);
    el.style.setProperty("inset", "auto", "important");
    shadow.querySelector(".toast").textContent = msg;
    document.documentElement.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }

  function applySettings() {
    const rm = root.querySelector(".rm");
    rm.style.setProperty("--fs", settings.fontSize + "px");
    rm.style.setProperty("--w", settings.width + "px");
    rm.style.setProperty("--lh", String(settings.lineHeight));
    rm.style.setProperty("--ff", `var(--${settings.font})`);
    rm.dataset.theme = settings.theme;
    root.querySelector('[data-val="fontSize"]').textContent = settings.fontSize;
    root.querySelector('[data-val="width"]').textContent = settings.width;
    root.querySelector('[data-val="lineHeight"]').textContent = settings.lineHeight.toFixed(1);
    root.querySelector('[data-act="font"]').textContent = FONTS[settings.font];
    root.querySelector('[data-act="theme"]').textContent = THEMES[settings.theme];
  }

  function step(key, dir) {
    const { min, max, step } = RANGES[key];
    const v = Math.round((settings[key] + dir * step) * 10) / 10;
    settings[key] = Math.min(max, Math.max(min, v));
  }

  function cycle(obj, cur) {
    const keys = Object.keys(obj);
    return keys[(keys.indexOf(cur) + 1) % keys.length];
  }

  function onBarClick(e) {
    const btn = e.target.closest("button");
    if (!btn) return;
    const act = btn.dataset.act;
    if (act === "close") return close();
    if (act === "font") settings.font = cycle(FONTS, settings.font);
    else if (act === "theme") settings.theme = cycle(THEMES, settings.theme);
    else {
      const [key, dir] = act.split(":");
      step(key, Number(dir));
    }
    applySettings();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => api.storage.sync.set({ [STORAGE_KEY]: settings }).catch(() => {}), 500);
  }

  function onContentClick(e) {
    const a = e.target.closest("a");
    if (!a || !isSamePageAnchor(a)) return;
    e.preventDefault();
    let id = new URL(a.href, location.href).hash.slice(1);
    try {
      id = decodeURIComponent(id);
    } catch {}
    const dest = root.getElementById(id) || root.querySelector(`[name="${CSS.escape(id)}"]`);
    dest?.scrollIntoView({ block: "start" });
  }

  function render(article) {
    const btn = (act, label, title) => `<button data-act="${act}" title="${title}">${label}</button>`;
    const { el, shadow } = makeHost(
      `<div class="rm" tabindex="-1">
        <div class="bar">
          ${btn("fontSize:-1", "A−", t("fontSmaller"))}<span class="val" data-val="fontSize"></span>${btn("fontSize:1", "A+", t("fontLarger"))}
          <span class="sep"></span>
          ${btn("width:-1", t("narrowerLabel"), t("narrower"))}<span class="val" data-val="width"></span>${btn("width:1", t("widerLabel"), t("wider"))}
          <span class="sep"></span>
          ${btn("lineHeight:-1", t("tighterLabel"), t("tighter"))}<span class="val" data-val="lineHeight"></span>${btn("lineHeight:1", t("looserLabel"), t("looser"))}
          <span class="sep"></span>
          ${btn("font", "", t("switchFont"))}${btn("theme", "", t("switchTheme"))}
          <span class="sep"></span>
          ${btn("close", "✕", t("closeTitle"))}
        </div>
        <article class="rm-page">
          <div class="meta"></div>
          <h1 class="title"></h1>
          <div class="content"></div>
          <div class="foot"><span></span><a target="_blank" rel="noopener noreferrer"></a></div>
        </article>
      </div>`
    );
    host = el;
    root = shadow;

    const content = shadow.querySelector(".content");
    content.replaceChildren(
      DOMPurify.sanitize(article.content, {
        FORBID_TAGS: ["style", "form", "input", "button", "textarea", "select"],
        FORBID_ATTR: ["style", "autoplay"],
        RETURN_DOM_FRAGMENT: true,
      })
    );
    if (article.lang) content.lang = article.lang;
    // Readability 有时把标题也留在正文开头，去重
    const first = content.querySelector("h1, h2");
    if (first && first.textContent.trim() === article.title.trim()) first.remove();

    shadow.querySelector(".title").textContent = article.title;
    // byline 过长多半是误识别的导航块
    const byline = article.byline && article.byline.length < 60 && !article.byline.includes("\n") ? article.byline : "";
    shadow.querySelector(".meta").textContent = [
      ...new Set([article.siteName || location.hostname, byline].filter(Boolean)),
      t("minutes", String(readingMinutes(article.textContent))),
    ].join(" · ");
    shadow.querySelector(".foot span").textContent = t("source");
    const src = shadow.querySelector(".foot a");
    src.href = location.href;
    let path = location.pathname;
    try {
      path = decodeURI(path);
    } catch {}
    src.textContent = location.hostname + path;

    const rm = shadow.querySelector(".rm");
    const bar = shadow.querySelector(".bar");
    bar.addEventListener("click", onBarClick);
    content.addEventListener("click", onContentClick);
    let lastTop = 0;
    rm.addEventListener("scroll", () => {
      bar.classList.toggle("hide", rm.scrollTop > lastTop && rm.scrollTop > 80);
      lastTop = rm.scrollTop;
    }, { passive: true });
    // 键盘事件不再冒泡到页面，避免触发站点快捷键
    // 键盘、滚轮、触摸事件不再冒泡到页面，避免触发站点快捷键或被平滑滚动库拦截
    for (const type of ["keydown", "keypress", "keyup", "wheel", "touchstart", "touchmove"]) {
      el.addEventListener(type, (e) => {
        e.stopPropagation();
        if (type === "keydown" && e.key === "Escape" && e.isTrusted) close();
      }, { passive: !type.startsWith("key") });
    }

    applySettings();
    prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    prevFocus = document.activeElement;
    document.documentElement.appendChild(el);
    rm.focus();
  }

  function prepareClone() {
    const doc = document.cloneNode(true);
    // 有 <base href> 时 Readability 会把 #锚点 解析到 base 上，先按页面地址改成绝对链接
    const pageUrl = location.href.split("#")[0];
    doc.querySelectorAll('a[href^="#"]').forEach((a) => a.setAttribute("href", pageUrl + a.getAttribute("href")));
    // 维基类站点标题里的「编辑」链接会让 Readability 把整个标题块当噪音删掉
    doc.querySelectorAll(".mw-editsection").forEach((n) => n.remove());
    return doc;
  }

  // Readability 去站名后缀按空格数词，对中文无效；用页面 h1 兜底
  function fixTitle(title) {
    const h1 = document.querySelector("h1")?.textContent.trim();
    return h1 && title.startsWith(h1) ? h1 : title;
  }

  async function open() {
    let article = null;
    try {
      article = new Readability(prepareClone()).parse();
    } catch (e) {
      console.warn("qingdu-reader:", e);
    }
    // 只有导航、链接列表的页面 Readability 也会返回结果，按正文长度再筛一道
    if (!article?.content || article.textContent.trim().length < 200) return toast(t("noArticle"));
    article.title = fixTitle(article.title);
    const stored = (await api.storage.sync.get(STORAGE_KEY))[STORAGE_KEY];
    settings = { ...DEFAULTS, ...stored };
    render(article);
  }

  function close() {
    if (!host) return;
    host.remove();
    host = root = null;
    document.documentElement.style.overflow = prevOverflow;
    prevFocus?.focus?.({ preventScroll: true });
  }

  // 防止 open() 等待存储期间再次触发而叠出两层
  function toggle() {
    if (host) return close();
    opening ??= open().finally(() => {
      opening = null;
    });
  }

  window.__readerMode = { v: api.runtime.getManifest().version, toggle };
  toggle();
})();
