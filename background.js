// 点击图标或 Alt+R：首次注入库和阅读器，之后只切换开关。
const api = globalThis.browser ?? chrome; // Firefox 用 browser，Chrome 用 chrome
const VERSION = api.runtime.getManifest().version;
const injecting = new Set();

api.action.onClicked.addListener(async (tab) => {
  if (injecting.has(tab.id)) return;
  const target = { tabId: tab.id };
  try {
    // 版本不一致说明是扩展重载前的旧脚本，重新注入
    // Firefox 在 about: 页面返回空数组；注入脚本出错时不 reject，而是放在 result.error
    const [probe] = await api.scripting.executeScript({
      target,
      func: (v) => window.__readerMode?.v === v,
      args: [VERSION],
    });
    let res;
    if (probe?.result) {
      [res] = await api.scripting.executeScript({ target, func: () => window.__readerMode.toggle() });
    } else {
      injecting.add(tab.id);
      [res] = await api.scripting.executeScript({
        target,
        files: ["lib/Readability.js", "lib/purify.js", "reader.js"],
      });
    }
    if (res?.error) console.warn("qingdu-reader:", res.error);
  } catch (e) {
    // chrome://、about:、扩展商店等受限页面无法注入
    console.warn("qingdu-reader:", e.message);
  } finally {
    injecting.delete(tab.id);
  }
});
