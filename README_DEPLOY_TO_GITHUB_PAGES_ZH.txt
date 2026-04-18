好吃家 v28 GitHub Pages 清理部署包

推荐用法：
1. 不要把外层文件夹再套一层上传到仓库里。
2. 把本目录中的“文件和文件夹本身”放到仓库根目录，或放到 /docs 目录。
3. GitHub Pages 的发布源建议设为：
   - branch root (/)
   - 或 branch /docs
4. 这个清理包只保留运行必需文件，避免把内部说明、提示词、计划日志一起公开。

已保留：
- index.html
- 404.html
- assets/
- data/
- manifest.webmanifest
- sw.js
- .nojekyll

特别注意：
- OCR / 条码兼容识别 / 3D WebGL 仍依赖外部 CDN 资源。
- 如果你希望完全离线或更稳定，建议把这些依赖改成本地静态文件。
