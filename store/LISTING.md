# 商店上架资料

上传包（`./build.sh` 生成）：Firefox 用 `dist/qingdu-reader-<版本>-firefox.zip`，Chrome 用 `dist/qingdu-reader-<版本>-chrome.zip`（去掉了 Firefox 专用字段）。图片都在本目录：`screenshots/`（1280×800）、`promo-440x280.png`、`marquee-1400x560.png`。

## 通用文案

**名称**：清读 Reader（英文界面显示 Qingdu Reader，由 `_locales` 决定）

**简介（中文）**
一键把杂乱的网页重排成干净舒适的阅读视图。可调字号、行宽、行距、字体和主题，针对中文排版优化。

**Summary (English)**
Turn cluttered pages into a clean reading view. Adjust font size, width, line height, typeface and theme. Great for Chinese text.

**详细描述（中文）**

清读把正文从广告、弹窗、侧栏和推荐流里提取出来，用舒适的版面重新排好，让你专心读完一篇文章。

- 一键开关：点击工具栏图标或按 Alt+R，再按一次或按 Esc 退出
- 正文提取：使用 Firefox 阅读视图同款的 Mozilla Readability，自动处理懒加载图片和相对链接
- 可调版面：字号、行宽、行距随手调节，设置会自动记住
- 字体与主题：黑体 / 宋体；自动 / 浅色 / 米黄 / 深色，自动模式跟随系统深色设置
- 中文优化：中文字体回退、中英文混排间距，修正中文标题后缀和维基百科小标题丢失等问题
- 脚注、代码块、表格、图片说明都有专门排版
- 隐私：不收集、不上传任何数据；只在你点击时读取当前页面，不在后台常驻

**詳細描述（繁體中文）**

清讀把正文從廣告、彈窗、側欄和推薦流裡提取出來，用舒適的版面重新排好，讓你專心讀完一篇文章。

- 一鍵開關：點擊工具列圖示或按 Alt+R，再按一次或按 Esc 離開
- 正文提取：使用 Firefox 閱讀檢視同款的 Mozilla Readability，自動處理延遲載入圖片和相對連結
- 可調版面：字級、欄寬、行距隨手調整，設定會自動記住
- 字體與主題：黑體／明體；自動／淺色／米黃／深色，自動模式跟隨系統深色設定
- 中文最佳化：中文字體回退、中英文混排間距
- 註腳、程式碼區塊、表格、圖說都有專門排版
- 隱私：不收集、不上傳任何資料；只在你點擊時讀取目前頁面，不在背景常駐

**Description (English)**

Qingdu Reader pulls the article out of ads, pop-ups, sidebars and recommendation feeds and lays it out in a calm, comfortable view.

- One click: press the toolbar button or Alt+R; press again or Esc to exit
- Article extraction powered by Mozilla Readability (the engine behind Firefox Reader View)
- Adjustable font size, column width and line height, remembered automatically
- Sans or serif typeface; auto, light, sepia or dark theme (auto follows your system)
- Tuned for Chinese: CJK font fallbacks and mixed-script spacing
- Clean styling for footnotes, code blocks, tables and captions
- Privacy: collects and sends no data. It only reads the current page when you click, and does not keep running in the background

**许可证**：MIT  **支持网址 / 邮箱**：建议至少填一个（仓库 issue 地址或联系邮箱），否则用户只能靠评论反馈问题

---

## Firefox：addons.mozilla.org（AMO）

- 分发方式：**在此网站上**（On this site，公开上架）
- 分类：Other（其他）或 Appearance（外观）；标签：reader, reading, typography, chinese
- 许可证：MIT License
- 隐私政策：不需要（不收集数据；`data_collection_permissions` 已声明 `none`）
- 上传：`dist/qingdu-reader-<版本>-firefox.zip`
- 源代码：选「否」（No）。`lib/` 是官方原版未修改文件，`reader.js`、`background.js` 未压缩
- **审核员备注**（Notes to Reviewer，原样粘贴）：

```
No build step. All files are hand-written and unminified except the third-party libraries in lib/, which are unmodified copies of the official releases:
- lib/Readability.js — @mozilla/readability 0.6.0: https://unpkg.com/@mozilla/readability@0.6.0/Readability.js
  sha256 34dcab3d0832d0019f02990eed6b6124e029e8c32b9f0c6f2550544ff8dff174
- lib/purify.js — dompurify 3.4.16: https://unpkg.com/dompurify@3.4.16/dist/purify.js
  sha256 acefba6ebc9733869f60c80b519eaefad1691ea56022c54a3e6cbe74286d8d46
innerHTML in reader.js only receives a static template and the add-on's own i18n strings; article HTML goes through DOMPurify (RETURN_DOM_FRAGMENT) and title/byline/URL are set via textContent.
The extension injects these scripts only on user action (toolbar button / Alt+R) via activeTab + scripting. No remote code, no network requests, no data collection.
To test: open any article page (e.g. a Wikipedia article) and click the toolbar button.
```

## Chrome Web Store

注册：<https://chrome.google.com/webstore/devconsole>，一次性 5 美元注册费。提交前还需要：Google 账号开启两步验证、验证联系邮箱、填写 trader / non-trader 声明（个人非商业选 non-trader）。

上传：`dist/qingdu-reader-<版本>-chrome.zip`

**商品详情（Store listing）**
- 说明：后台会按包内语言列出 English（默认）、中文（简体）、中文（繁體）三个条目，分别贴英文、简体、繁体详细描述
- 类别：Tools（工具）
- 图标：包内 `icons/icon128.png` 会自动使用（如需单独上传，用同一文件）
- 屏幕截图：`screenshots/` 下 4 张（1280×800，已去 alpha）。English 条目把 `3-en-sepia.png` 放第一张
- 小型宣传图块 440×280：`promo-440x280.png`
- 顶部宣传图块 1400×560（可选）：`marquee-1400x560.png`

**隐私权（Privacy practices）**
- 单一用途（Single purpose）：
  > 把当前网页重排成干净的阅读视图。Reformat the current web page into a clean, distraction-free reading view.
- 权限理由（Permission justification）：
  - `activeTab`：仅在用户点击工具栏按钮或按快捷键时，访问当前标签页以提取正文。Access the current tab only when the user clicks the toolbar button or presses the shortcut, to extract the article.
  - `scripting`：在用户触发后向当前页注入阅读视图脚本。Inject the reader view script into the current page after the user triggers it.
  - `storage`：保存用户的字号、行宽、行距、字体、主题偏好，经用户自己的浏览器同步保存，不发送给开发者。Save the user's font size, width, line height, typeface and theme preferences, synced via the user's own browser sync (storage.sync); nothing is sent to the developer.
- 远程代码（Remote code）：否，所有代码都在扩展包内。No, all code is packaged in the extension.
- 数据使用：不勾选任何数据类型；勾选三项承诺（不出售、不用于无关用途、不用于信贷评估）
- 隐私权政策网址：不收集数据时可不填

**分发（Distribution）**：公开（Public），所有地区
