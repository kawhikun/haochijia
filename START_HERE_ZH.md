# 好吃家 v30 使用说明

## 本地直接试用

### Windows
双击 `start-local.bat`

### macOS
双击 `start-local.command`

### 通用
运行：

```bash
python3 run_local_server.py
```

浏览器打开脚本提示的地址，一般是：

```text
http://127.0.0.1:8765/index.html
```

## 线上部署
把整个目录完整上传到静态站点，不要只传部分文件。

## 这次额外修了什么
- clean 包现在真的附带本地启动文件，不再“页面提示有、包里却没有”。
- 音乐区和手动营养输入区追加了移动端纵向拖动辅助，减少“手指按在控件上却拉不动页面”的情况。
- Service Worker 缓存版本已提升，降低旧包残留。
