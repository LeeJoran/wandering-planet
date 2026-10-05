# 小程序适配层（未来）

本阶段只有 Web 实现。将来移植到小程序时，在这里按 `../types.ts` 的接口实现：

- `IStorage`   → wx.setStorageSync / wx.getStorageSync（或云开发数据库）
- `IRecorder`  → wx.getRecorderManager
- `ILifecycle` → App.onHide / App.onShow
- `IPhotoPicker` → wx.chooseImage

`core/` 与 `ui/` 不依赖具体平台，接口实现替换后即可切换。
