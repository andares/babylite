# 12 · 无头渲染与性能工程

> **效果检索词**：无头/headless/Null 引擎/服务器端渲染 · 固定步长 fixed timestep/确定性模拟 · 资源池/引用计数/ref count · 采样器去重/sampler dedup · 存储缓冲/storage buffer · 包体/bundle size/树摇 tree-shaking · 设备丢失/device lost/恢复 recovery · 错误处理/error code/遥测 telemetry
> **源页快照**（skill 根相对路径，含完整源码级细节）：`references/raw-doc/05-headless-null-engine.md` · `references/raw-doc/architecture/37-resource-pool.md` · `references/raw-doc/architecture/38-bundle-size-tooling.md` · `references/raw-doc/architecture/47-storage-buffer.md` · `references/raw-doc/architecture/49-error-handling.md` · `references/raw-doc/architecture/50-device-lost-recovery.md`

## API 范围

| API | 用途 | 要点 |
| --- | --- | --- |
| `createNullEngine(options?)` | 无 GPU/无 canvas 引擎（服务器端模拟） | 同步（无需 await）；`options` 为未来预留；**实验性原型**，只做模拟不做渲染 |
| `stepScene(engine, scene, deltaMs)` | 手动推进一个模拟步 | 代替 `startEngine`：设定帧 delta 并触发全部 `onBeforeRender` 回调（物理/动画由此前进）；delta 原样使用，恒定 `1000/60` 即固定步长确定性模拟 |
| `runHeadlessSteps(engine, scene, steps, deltaMs?)` | 便捷循环驱动 | 等价循环调 `stepScene`；`deltaMs` 默认 `1000 / 60` |
| `createSceneContext(engine, { defaultRenderTask: false })` | 无渲染场景 | **必须**传 `defaultRenderTask: false`，否则仍会建 swapchain/GPU 资源 |
| — 无头限制 | 内部/低层 | 无头不支持：任何渲染（`startEngine`/`captureScreenshot` 等）、带材质的网格、mesh/凸包碰撞器（原始形状需显式 `extents`/`radius` 或 `boundMin`/`boundMax`）、F64 浮点原点矩阵；推荐宿主 Node.js（Deno/Web Worker/CI 也可） |
| `acquireTexture(tex)` / `releaseTexture(tex)` | 纹理引用计数（内部/低层） | 释放至 0 时 `tex.texture.destroy()` 并返回 true；无先验 acquire 直接 release 视为 1 → 销毁 |
| `acquireGPUTexture` / `releaseGPUTexture` | 原始 `GPUTexture` 引用计数（内部/低层） | 用于环境 cubemap、BRDF LUT 等；WeakMap 跟踪，无显式清理 |
| `getOrCreateSampler(device, desc?)` | 采样器去重工厂（内部/低层） | 同配置（7 字段 key）→ 同一 `GPUSampler`；默认全 nearest、clamp-to-edge、anisotropy 1 |
| `clearSamplerCache(device)` | 清空设备采样器缓存（内部/低层） | 设备用 WeakMap 键，设备丢失/销毁自动失效 |
| `createStorageBuffer(engine, data, label?)` | shader 可读存储分配 | 替代旧裸 `GPUBuffer` 参数；稳定身份——改内容不重建材质 bind group |
| `updateStorageBuffer(engine, buffer, data, byteOffset?)` | 更新存储缓冲 | 走 `queue.writeBuffer`；偏移与长度须 4 字节对齐；零长度更新是 no-op；disposed 后更新/重绑会 throw |
| `disposeStorageBuffer(buffer)` | 销毁存储缓冲 | 幂等；`setShaderStorageBuffer(material, name, buffer)` 接受 `StorageBuffer \| null`，先解绑再销毁 |
| `enableErrorDecoding()` | 错误全量解码 | 默认错误只有 `#<code>` + `error.lite` 参数数组；**import 即把消息表拉进 bundle**，生产慎用（放 dev/debug flag 后） |
| `decodeError(error)` | 按需解码单个错误 | 未开启解码也能用；非 Lite 错误原样返回 message，永远安全；生产遥测推荐 `await import(...)` 懒加载 |
| `enableDeviceLostSceneRecovery(engine, options?)` | 设备丢失恢复（场景） | opt-in；必须在环境加载/纹理创建**之前**启用才能保留恢复源；返回 handle，`disable()` 幂等 |
| `enableDeviceLostSpriteRecovery(engine, options?)` | 设备丢失恢复（精灵） | 同上；恢复 atlas/自定义纹理/离屏 RT，CPU 实例状态保持不变 |
| `enableDeviceLostTextRecovery(engine, options?)` | 设备丢失恢复（文本） | 同上；从 `GlyphStorage` CPU 数组重建 Slug 曲线/带状 atlas |
| — 恢复回调（内部/低层） | `DeviceLostRecoveryCallbacks` | `onLost`（换设备前）/ `onRecovered`（重建+首帧后）/ `onRecoveryFailed`（引擎完好时可弃用）；已注册但无 handler 的 kind 会使恢复失败而非带病续跑；阴影仅支持方向 ESM（PCF/CSM 显式失败）；glTF `EXT_lights_image_based` 环境暂不可恢复 |
| — 包体工具链（内部/低层） | `pnpm build:bundle-scenes` / `build:bundle-master-info` | 每个 lab 场景构建产物实测；硬门是 `scene-config.json` 的 `maxRawKB`（超限即 fail），master 基线仅用于 advisory delta；恢复等 opt-in 特性靠动态 import 分块，不启用零成本 |

⚠️ **心智模型**：这一主题的"性能"主要来自**不为不用到的代码付费**——错误文本、恢复逻辑、材质扩展全是懒加载/树摇分块；无头路径则干脆不建任何 GPU 资源。启用类调用（`enableXxx`、`createStorageBuffer`）是真实依赖声明，别当噪音删。

## 最小示例

无头固定步长模拟（官方 Quick start，Node.js 可直接跑）：

```ts
import { createNullEngine, stepScene, createSceneContext, onBeforeRender, createTransformNode } from "@babylonjs/lite";

const engine = createNullEngine();                                    // 无设备、无 canvas，同步
const scene = createSceneContext(engine, { defaultRenderTask: false }); // 关键：不建渲染任务/GPU 资源

const node = createTransformNode("mover", 0, 10, 0);
const stepMs = 1000 / 60;
const dt = stepMs / 1000;
let velocityY = 0;
onBeforeRender(scene, () => {                       // 物理/动画共用的每帧钩子
    velocityY += -9.81 * dt;
    node.position.set(node.position.x, node.position.y + velocityY * dt, node.position.z);
});

for (let i = 0; i < 180; i++) stepScene(engine, scene, stepMs);   // 推进 3 秒，零渲染
console.log("final y:", node.position.y);
```

生产遥测：错误码按需解码（参照 49 源页 "production-telemetry" 一节结构）：

```ts
try {
    // …some Lite call…
} catch (err) {
    const { decodeError } = await import("@babylonjs/lite");  // 消息表仅在真正出错时才拉取
    telemetry.report(decodeError(err));                       // 从 #<code> + error.lite 还原完整消息
}
```

## 相关效果

| 效果 | 关键 API | 原文档 |
| --- | --- | --- |
| 服务器端物理（Havok 无头） | `createNullEngine` + `createHavokWorld` + `stepScene` | https://doc.babylonjs.com/lite/05-headless-null-engine/#real-physics--havok-headless |
| 确定性 CI 回归测试 | `stepScene` 固定 delta / `runHeadlessSteps` | https://doc.babylonjs.com/lite/05-headless-null-engine/#fixed-timestep--determinism |
| 纹理共享不重复销毁 | `acquireTexture` / `releaseTexture` | https://doc.babylonjs.com/lite/architecture/37-resource-pool/ |
| 采样器复用省对象 | `getOrCreateSampler` | https://doc.babylonjs.com/lite/architecture/37-resource-pool/#sampler-deduplication |
| 自定义 shader 大数据传递 | `createStorageBuffer` + `setShaderStorageBuffer` | https://doc.babylonjs.com/lite/architecture/47-storage-buffer/ |
| 最小包体 + 可读错误 | `decodeError`（懒 import）/ `enableErrorDecoding`（仅 dev） | https://doc.babylonjs.com/lite/architecture/49-error-handling/ |
| 掉卡/驱动重置自动恢复 | `enableDeviceLostSceneRecovery`（+ Sprite/Text 变体） | https://doc.babylonjs.com/lite/architecture/50-device-lost-recovery/ |
| 包体尺寸度量与门禁 | `pnpm build:bundle-scenes`（`maxRawKB` 硬门） | https://doc.babylonjs.com/lite/architecture/38-bundle-size-tooling/ |
| 常规 GPU 时序/性能分析 | `waitForGpuIdle` / `getRenderTaskGpuTimings`（见 01 主题） | https://doc.babylonjs.com/lite/architecture/22-engine/ |
