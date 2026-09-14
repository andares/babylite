# 11 · 物理与 WebXR

> **效果检索词**：物理 / Havok / 刚体 rigid body / 碰撞体 collider / 碰撞事件 collision events / 触发器 trigger / 射线检测 raycast / 高度图碰撞 heightfield / 角色控制器 character controller / 浮点原点 floating origin / WebXR / VR / AR / 手柄 controller
> **源页快照**（skill 根相对路径，含完整源码级细节）：`references/raw-doc/architecture/42-physics.md` · `references/raw-doc/architecture/42-webxr.md`

## API 范围

| API | 用途 | 要点 |
| --- | --- | --- |
| `createHavokWorld(scene, hknp)` | 创建物理世界 | 需先 `await HavokPhysics({ locateFile: ... })` 加载 WASM（惰性，仅此时引用）；世界步长默认 `0`（跟随场景 delta）；注册每帧 step 到 `scene._beforeRender` |
| `disposePhysics(world)` | 销毁世界 | 先注销 step 回调再释放原生世界，否则 WASM 堆 use-after-free；见 `physics-dispose.test.ts` |
| `createPhysicsBody(...)` | 创建刚体 | `PhysicsBody` 是纯状态接口（非类），形状/聚合体随 body 创建 |
| `createPhysicsAggregate(world, mesh, PhysicsShapeType, opts)` | 给网格一键加"刚体+形状" | 官方示例常用快捷方式（见 05-headless 页）：`createPhysicsAggregate(world, ground, PhysicsShapeType.BOX, { mass: 0, extents: {...} })`；opts 支持 `mass`/`extents`/`restitution` |
| `applyPhysicsBodyForce(world, body, ...)` | 施加力 | force → impulse over one step；用 `worldStepSeconds(world)` 解析有效步长（循环外调用者） |
| `setPhysicsTimestepMs(world, fixedDeltaMs)` / `getPhysicsTimestepMs` | 固定步长（毫秒） | 首选；`0` = 跟随场景 delta；与 `scene.fixedDeltaMs` 单位一致 |
| `setPhysicsTimestep(world, seconds)` / `getPhysicsTimestep` | 固定步长（秒） | 等价秒版访问器；新代码建议用 ms 版 |
| `onPhysicsAfterStep` | 每步后回调 | 收到的 `dt` 为秒；注册在 `world._afterStep` |
| `setPhysicsBodyCollisionEventsEnabled` | 启用碰撞事件 | **opt-in**（`havok-collision.ts`），配合 `onPhysicsCollision`（started/continued/finished） |
| `setPhysicsShapeIsTrigger` | 形状设为触发器 | **opt-in**（`havok-trigger.ts`）；`onPhysicsTrigger` / `onPhysicsTriggerBodies` 订阅返回 disposer |
| `physicsRaycast` / `shapeCast` / `shapeProximity` | 查询 | **opt-in**（`havok-queries.ts`）；shapeCast 只接受单个 `ignoreBody` |
| `createHeightFieldShape` | 高度图碰撞形状 | **opt-in**（`havok-heightfield.ts`） |
| `moveWithCollisions` | 角色控制器移动 | 运动学 cast-and-slide；位移→速度用 `worldStepSeconds(world)`；`getPhysicsCharacterControllerBody` 取背后 body |
| `enableHavokFloatingOrigin` | 多区域大世界模拟 | 配合 Large World Rendering（35 源页）；**opt-in** 按需加载 |
| `createPhysicsViewer(...)` + `show*/hide*` | 调试线框 | 碰撞形状 wireframe 叠加（`physics-viewer.ts`） |
| `worldStepSeconds(world)` | 内部/低层 | 循环外调用的有效步长解析（秒）：world 固定 → scene 固定 → 引擎真实帧 delta；首帧可能为 `0` |
| `isWebXrPresent()` / `isWebGpuXrSupported()` / `isXrSessionSupported(mode)` | WebXR 能力检测 | `XRGPUBinding` 目前所有浏览器均无（返回 false）；`isXrSessionSupported` 永不 throw |
| `enterXr(scene, options?)` | 进入 XR 会话 | 返回 `Promise<XrSessionContext>`；`XrSessionOptions`：`mode`（默认 `"immersive-vr"`）、`referenceSpaceType`（默认 `"local-floor"` 回退 `"local"`）、`requiredFeatures` 会合并强制 `"webgpu"`、`input: false` 关输入；内部先 `stopEngine` 交出渲染循环 |
| `exitXr(ctx)` | 退出 XR | `session.end()` → cleanup（幂等）→ `startEngine` 恢复 canvas 循环 |
| `createXrCamera(eye)` / `updateXrCameraForView(...)` | 内部/低层 | 每眼一个相机；直接写矩阵缓存注入 view/projection（非对称视锥）；aspect 必须与 render task 位级一致 |
| `createXrInputManager(session, callbacks)` / `updateXrInputPoses(...)` / `disposeXrInputManager(...)` | 手柄/输入源 | `XrInputCallbacks`：`onInputSourcesChange` / `onSelectStart|Select|SelectEnd` / `onSqueezeStart|Squeeze|SqueezeEnd`；`targetRayMatrix` / `gripMatrix` 各有 tracked 标志 |

⚠️ **两个心智模型**：物理是"纯状态 handle + 自由函数"（无 `PhysicsBody` 类方法，`body.applyForce()` → `applyPhysicsBodyForce(world, body, ...)`）；
物理步长处处用毫秒，仅在 Havok 边界转秒，且 `dt` 钳制 `Math.min(dt, 0.1)`（100 ms 上限，防隧穿/求解器爆炸）。WebXR 模块基于**草案 WebXR WebGPU 绑定**，
**当前无浏览器可运行**；不含 teleport/手部关节/触觉/AR hit-test/anchor。

## 最小示例

物理世界生命周期（官方示例，42-physics 页）：

```ts
import HavokPhysics from "@babylonjs/havok";

const hknp = await HavokPhysics({ locateFile: () => "/HavokPhysics.wasm" });
const world = createHavokWorld(scene, hknp);          // world step 默认 0，跟随场景
// ... createPhysicsBody / applyPhysicsBodyForce 等 ...
setPhysicsTimestepMs(world, 1000 / 30);               // 可选：固定 30fps 物理步长
disposePhysics(world);                                 // 停止 step 并释放原生世界
```

进入 VR 会话（参照 42-webxr 页 Public API Surface 与生命周期伪代码）：

```ts
if (await isXrSessionSupported("immersive-vr")) {
    const ctx = await enterXr(scene, {
        mode: "immersive-vr",                          // 或 "immersive-ar"（AR 自动 clearColor.a = 0 透传）
        referenceSpaceType: "local-floor",
        input: {
            onSelectStart: (i) => grab(i.targetRayMatrix),
            onSelectEnd:   (i) => release(),
        },
        onFrame: (ctx, frame, time) => { /* 每帧 XR 回调，ctx.cameras 为按眼相机 */ },
        onEnd: () => console.log("xr ended"),
    });
    // exitXr(ctx);  // 退出并恢复 canvas 渲染循环
}
```

## 相关效果

| 效果 | 关键 API | 原文档 |
| --- | --- | --- |
| 刚体掉落 / 堆叠 | `createHavokWorld` + `createPhysicsBody` | https://doc.babylonjs.com/lite/architecture/42-physics/#world-lifecycle |
| 确定性物理回放 | `scene.fixedDeltaMs` + `setPhysicsTimestepMs` | https://doc.babylonjs.com/lite/architecture/42-physics/#timestep--delta-time-propagation |
| 碰撞开始/结束事件 | `setPhysicsBodyCollisionEventsEnabled` + `onPhysicsCollision` | https://doc.babylonjs.com/lite/architecture/42-physics/#feature-modules-opt-in |
| 区域触发器 | `setPhysicsShapeIsTrigger` + `onPhysicsTrigger` | https://doc.babylonjs.com/lite/architecture/42-physics/#feature-modules-opt-in |
| 射线/形状检测 | `physicsRaycast` / `shapeCast` / `shapeProximity` | https://doc.babylonjs.com/lite/architecture/42-physics/#feature-modules-opt-in |
| 地形碰撞 | `createHeightFieldShape` | https://doc.babylonjs.com/lite/architecture/42-physics/#feature-modules-opt-in |
| 第三人称角色移动 | `moveWithCollisions` + `getPhysicsCharacterControllerBody` | https://doc.babylonjs.com/lite/architecture/42-physics/#feature-modules-opt-in |
| 大世界物理 | `enableHavokFloatingOrigin` | https://doc.babylonjs.com/lite/architecture/35-large-world-rendering |
| 碰撞体可视化调试 | `createPhysicsViewer` + `show*` / `hide*` | https://doc.babylonjs.com/lite/architecture/42-physics/#feature-modules-opt-in |
| VR / AR 会话 | `enterXr` / `exitXr` / `isXrSessionSupported` | https://doc.babylonjs.com/lite/architecture/42-webxr/#public-api-surface |
| VR 手柄拾取 | `createXrInputManager` + select/squeeze 回调 | https://doc.babylonjs.com/lite/architecture/42-webxr/#xrxr-inputts |
