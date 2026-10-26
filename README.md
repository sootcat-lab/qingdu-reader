# 清读 Reader

阅读模式插件（MV3，Firefox / Chrome 通用）。点图标或按 `Alt+R`，把当前网页重排成干净的阅读视图，再按一次或按 `Esc` 退出。

## 安装

上架后直接在 Firefox 附加组件商店 / Chrome 应用商店搜索「清读 Reader」安装。

开发调试：
- Firefox：`about:debugging#/runtime/this-firefox` →「临时载入附加组件」→ 选 `manifest.json`（重启后消失）
- Chrome：`chrome://extensions` → 开启「开发者模式」→「加载已解压的扩展程序」→ 选本目录

快捷键不生效时：Firefox 在 `about:addons` → 齿轮 →「管理扩展快捷键」，Chrome 在 `chrome://extensions/shortcuts`。Firefox 隐私窗口默认不运行，需在扩展详情里打开。

## 发布

1. 改 `manifest.json` 的 `version`（商店不接受重复版本号）
2. `./build.sh` → 生成 `dist/qingdu-reader-<版本>-firefox.zip` 和 `-chrome.zip`（Chrome 包去掉了 Firefox 专用字段）
3. 分别上传到 AMO 和 Chrome Web Store，文案、截图、权限说明见 `store/LISTING.md`

## 实现

- 正文提取：`@mozilla/readability` 0.6.0（Firefox 阅读视图同款），在 `document.cloneNode(true)` 上运行，不破坏原页面；懒加载图片和相对链接由 Readability 处理
- 净化：`DOMPurify` 3.4.16（未压缩版，便于商店审核），去掉 `style`、表单和 `autoplay`；外链加 `target=_blank rel=noopener`
- 渲染：closed Shadow DOM 全屏遮罩，样式和页面互不影响；页内锚点（脚注）在遮罩内跳转
- 设置：字号 / 行宽 / 行距 / 黑体·宋体 / 主题（自动·浅色·米黄·深色），存在 `storage.sync`
- 权限只有 `activeTab` + `scripting` + `storage`，不在任何页面常驻，只在你点击时注入

## 文件

| 文件 | 作用 |
| --- | --- |
| `manifest.json` | 清单 |
| `background.js` | 点击 / 快捷键时注入，或切换已注入的阅读器 |
| `reader.js` | 提取、净化、渲染、工具栏 |
| `lib/` | Readability 与 DOMPurify 原版文件及许可证 |
| `_locales/` | 界面文字（en / zh_CN / zh_TW） |
| `build.sh` | 打包 Firefox / Chrome 两个上传包 |
| `store/` | 商店文案、截图、宣传图、演示页（不进安装包） |
