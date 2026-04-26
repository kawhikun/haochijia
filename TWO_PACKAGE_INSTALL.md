# 好吃家 v42 两包安装说明

这次拆成两个 ZIP，目的是降低单个包体积，方便上传/下载测试。

## 使用方式

1. 先解压 Part 1 到部署目录。
2. 再解压 Part 2 到同一个部署目录。
3. 如果系统询问是否合并/覆盖文件夹，选择“合并”或“覆盖”。
4. 最终目录里应同时存在：
   - index.html
   - assets/
   - data/foods-cn.min.json
   - data/foods-global.part01.min.json
   - data/foods-global.part02.min.json

## 注意

- Part 1 可以用于检查页面、模型、中文食品库和核心功能。
- 要恢复完整全球食品库，必须再合并 Part 2。
- 覆盖部署不会主动清理用户本机 localStorage 或 IndexedDB 历史数据。
