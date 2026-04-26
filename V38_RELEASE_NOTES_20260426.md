# Haochijia v38 Human Panel + Translation + Intake + Photo Build

本次以 v37 新版本为主线修改，v28 仅用于参考并迁移食品标签清洗思路；没有回退旧版界面结构。

## 主要强化

- **人体模型面板重做**：新增实时身体指标浮层，身高、体重、腰围、臀围、体脂等输入会即时联动 BMI、腰臀比、目标热量、蛋白和饮水建议；3D/Canvas 人体模型新增胸围、腰围、臀围参考环与中心线。
- **成熟 3D 方案兼容**：保留本地 Three.js 程序化人体模型，不把第三方头像服务作为硬依赖；结构上兼容 GLB/Three.js 生态，避免断网时面板空白。
- **食品库中文优先**：中文库、国际库 01、国际库 02 的 `z` 与 `labels.zh` 已批量同步为中文展示名；全球库仍保留英文名和原始名用于搜索、条码与 OCR 匹配。
- **营养建议更科学**：建议卡片加入“行动建议 + 依据”结构，按热量、蛋白、纤维、钠、糖、水、BMI、腰臀比等指标给出优先级；计算依据在界面中直接展示。
- **每日摄入记录增强**：新增日期切换、回到今天、+250mL 水、一键再记一份、删除、当天热量/蛋白/纤维/水/钠汇总和营养素标签。
- **拍照识别增强**：食品营养表入口新增“智能识别”，先尝试条码，再尝试 OCR；结果会显示识别来源、置信度、匹配食品和营养字段覆盖度。身体照片上传入口改为移动端相机友好的 `capture=user`。
- **营养元素环缓慢移动**：六个营养环加入低幅度缓动漂浮动画，并保留 reduced-motion 兼容。
- **PWA 缓存更新**：缓存版本更新为 v38，包含新模块、食品库版本参数和本地 Three.js vendor 文件。

## 食品库审计

- 总条目：109,910
- 中文展示名缺失：0
- 本次估算修正中文展示名：40,445 条
- 仍使用通用中文兜底“进口食品”的条目：9,947 条；这些条目通常原始名称极短、品牌化或无法从品类推断具体食物，搜索仍可通过英文/原始名命中。

## 验证

- `assets/core.js` ES module syntax check passed
- `assets/model-scene.js` ES module syntax check passed
- `assets/nutrition-refs.js` ES module syntax check passed
- `assets/food-label-upgrade.js` ES module syntax check passed
- `sw.js` syntax check passed
- 食品库 `z` 中文字段检查：3 个库均为 0 缺失
