# Haochijia v42 · Mobile Body Model + Scientific Advice

Date: 2026-04-26

## 本次集中修复

- 不改变 `localStorage` / `IndexedDB` 主存储键，覆盖部署不会主动清理用户本地数据。
- Service Worker 只清理 `haochijia-` 前缀的旧缓存，不触碰用户数据。
- 人体模型继续使用 v41 的轻量标准男 / 女身体网格，并加强触控交互：
  - 单指旋转
  - 双指缩放 / 旋转
  - 鼠标滚轮缩放
  - 双击 / 双击触碰回正
- 标准模型材质、轮廓光、地面光晕、主光源做了轻量美化，不增加高面数模型。
- 身体维度联动确认并增强：
  - 性别切换标准男 / 女网格
  - 身高、体重、体脂影响整体比例和体量
  - 肩宽、胸围、腰围、腹围、臀围影响对应躯干部位
  - 上臂、前臂、大腿、小腿、脚踝影响对应四肢部位
  - 身体照片捏形参数继续叠加到肩、胸、腰、臀、手臂、腿部
- 移动端适配：
  - Canvas `touch-action: none`
  - iOS / Android 安全区和 `svh` 高度适配
  - 低功耗设备继续限制 DPR 和帧率
- 营养建议科学性复查：
  - 钠普通上限改为 WHO 成人少于 2000 mg/天
  - 高血压模式保留更严格 1500 mg/天提示
  - 饮水目标改为“饮水”口径，采用中国居民膳食指南低活动成人男 1700 mL、女 1500 mL 为基础
  - 饱和脂肪按 WHO 总能量约 10% 上限；血脂风险模式约 6%
  - 糖建议明确为“总糖作为游离糖保守代理”，提醒结合配料表判断添加糖
  - 建议卡片参考今日摄入、近 7 天历史平均与最近 3 个有记录日趋势

## 检查项

- 未发现 `localStorage.clear()`、`removeItem()`、`indexedDB.deleteDatabase()` 等清库逻辑。
- 版本号：`v42-mobile-touch-body-model-scientific-advice`
- 主用户数据键仍为：`haochijia.core.v39.snapshot`
- IndexedDB 仍为：`haochijia-core-v39`
