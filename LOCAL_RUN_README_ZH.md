# 本地打开说明（非常重要）

## 为什么双击 index.html 会像“坏了一样”

这个项目不是普通静态宣传页，而是一个带有：
- ES Modules（模块脚本）
- `fetch()` 读取本地 JSON 食品库
- Service Worker 缓存
- 条码识别安全能力
- OCR / 兼容识别脚本动态加载

的 Web App。

当你直接双击 `index.html`，浏览器地址会变成 `file:///...`。这种打开方式会让一部分能力被浏览器限制，所以典型现象就是：
- 按钮像没反应
- 食品库搜不到
- 条码识别不稳定或失效
- 音乐区 / 抽屉 / 联动逻辑看起来没执行

## 正确做法

### Windows
双击：`start-local.bat`

### macOS
双击：`start-local.command`

### 通用命令行
在当前目录运行：

```bash
python3 run_local_server.py
```

启动后，浏览器里打开脚本提示的网址，通常是：

```text
http://127.0.0.1:8765
```

## 线上部署

如果你是传到服务器 / GitHub Pages / 静态托管，请把整个目录完整上传，不要只替换零散文件。


这版还修复了一个会让页面启动中断的真实脚本错误：如果你之前看到按钮像没反应、音乐点了没声、上传和搜索像死掉，原因之一就是初始化在 `applyLanguage()` 阶段被 `currentLang is not defined` 直接打断了。
