# 好吃家 v30 GitHub 云端备份说明

## 适用场景
- 你把好吃家部署在 GitHub Pages
- 你想把本地记录额外保存到 GitHub 仓库
- 你想跨设备恢复同一份记录

## 页面里怎么用
1. 打开首页的 `GitHub 备份`
2. 填写：
   - owner
   - repo
   - branch
   - path（推荐 `backups/haochijia/latest.json`）
   - token
3. 点击：
   - `上传备份`
   - 或 `恢复备份`

## 建议
- 使用单独的备份路径，不要覆盖主站入口文件。
- 优先使用 Contents 权限最小化的 token。
- token 默认不持久保存，只在当前会话输入框中使用。

## 本地兜底
即使不用 GitHub 备份，v30 也已经加入：
- 本地导出全部记录
- IndexedDB 镜像恢复
- 浏览器持久化存储申请
