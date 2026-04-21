# 好吃家 v22 强化补丁（2026-04-17）

本次补丁聚焦：

1. 音乐点击无声：增强 Web Audio 解锁与恢复；补上 `controller.play()` / `pause()` 兼容别名；前台恢复时自动尝试恢复音频上下文。
2. 按钮无反应：修正 v22 面板路由。
   - `capture` 现在真正打开上传 / 识别链路，而不是只停留在食品搜索面板。
   - `today` 现在打开独立“今日记录”抽屉，而不是混入数据说明页。
   - 3D 人体快捷按钮里的“记录”入口改为直达今日记录。
3. 双食品库联动：搜索默认同时检索中国库 + 国际库，当前库优先排序并去重；搜索结果显示来源标签；扫码命中支持跨库回填。
4. 食品库装入系统：现有运行包已包含中国库与全球包装食品库中文标签数据，本补丁把两库检索、扫码、上传链路打通。
5. 3D 人体模型：增强舞台光效、环形引导线、核心辉光与细节线，离线回退模型也更有层次。
6. 界面更简洁：将“今日记录”和“数据说明”拆分为独立抽屉；上传抽屉直接滚到高级识别区；底部抽屉留白更紧凑。
7. 缓存更新：Service Worker 缓存版本已提升，避免旧 JS / CSS 残留导致你看到“点了没反应”的旧问题。

建议部署后：
- 首次打开请强制刷新一次。
- 若仍看到旧界面，清理站点缓存 / Service Worker 后再试。


## 2026-04-17 serious startup fix
- Fixed a fatal boot crash in `assets/app.js`: `renderComboPanel()` referenced `currentLang()` even though the web app only exposes `uiLang()`. Because `init()` called `applyLanguage()` before `bindEvents()`, this one ReferenceError aborted the whole startup chain and left music / search / upload / sheet buttons looking dead.
- Hardened `init()` with `safeInitStep()` so one rendering bug can no longer cancel the whole boot sequence.
- Fixed `assets/body-module.js` missing template helper `t(...)`, which could later break timeline text rendering inside the body module.
