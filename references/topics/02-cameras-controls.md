# 02 · 相机与操控

> **效果检索词**：相机 camera · 轨道 orbit / ArcRotate · 第一人称 free camera / WASD · 正交投影 orthographic / 2.5D · 地球仪 / geospatial / ECEF · 大世界 / floating origin / LWR / 大坐标精度
> **源页快照**（skill 根相对路径，含完整源码级细节）：`references/raw-doc/architecture/02-camera.md` · `references/raw-doc/architecture/34-geospatial-camera.md` · `references/raw-doc/architecture/35-large-world-rendering.md`

## API 范围

| API | 用途 | 要点 |
| --- | --- | --- |
| `createArcRotateCamera(alpha, beta, radius, target)` | 轨道相机工厂 | 纯数据对象，不认识 scene/DOM；左手系球坐标（alpha 绕 Y，beta 自 +Y 极角）；默认 `fov=0.8` `nearPlane=0.1` `farPlane=1000` `inertia=0.9` `panningInertia=0.9` |
| `attachControl(camera, canvas, scene?)` | 轨道相机操控（指针/滚轮/触摸） | 左拖旋转、右拖平移、滚轮缩放（随 radius 对数手感）、双指捏合直接改 radius；返回 cleanup 函数；惯性经 `scene._beforeRender` 每帧衰减，beta 夹在 `[0.01, π-0.01]` |
| `createFreeCamera(position, target)` | 自由相机工厂（第一人称） | 纯数据；默认 `speed=2.0` `angularSensitivity=2000` `nearPlane=1` `farPlane=10000`；position/target 为 ObservableVec3，写入即标脏 |
| `attachFreeControl(camera, canvas, scene?)` | 自由相机操控（键盘+鼠标） | WASD/方向键移动、Space/Shift 升降、鼠标拖拽 yaw/pitch（pitch 夹 ±(π/2−0.01)）；canvas 无 tabindex 时自动设 `tabIndex=0`；返回 cleanup |
| `enableOrthographicCamera(camera, bounds?)` | 切正交投影（opt-in） | 任意满足 `Camera` 契约的相机可用；bounds 形如 `{ halfHeight?, left?, right?, bottom?, top? }`（留 `null` 的平面由 `halfHeight` × 宽高比推导）；返回**活跃的** `camera.ortho` 对象，每帧改字段即改即生效（推 invalidate 投影缓存）；正交下 `fov` 无效，缩放靠改 `halfHeight` |
| `disableOrthographicCamera(camera)` | 切回透视 | 清掉共享缓存中正交独有的 `m[12]/m[13]/m[15]`，安全还原 |
| — 正交运行时动画 | `ortho.halfHeight` 是动画属性路径 | `createPropertyAnimationClip` 可直接绑定 `"ortho.halfHeight"` 等路径；字段 setter 精确 bump `_projRev`（不是相机位移，不触发浮动原点全场景 rebase） |
| `createGeospatialCamera({ planetRadius })` | 地球轨道相机工厂 | 绕原点球形行星公转；由 `center`（ECEF 锚点）/`yaw`/`pitch`/`radius`（眼到 center 距离）四参完全描述；纯状态，不引用 scene |
| `setGeospatialOrientation(camera, orientation)` | 一次性设位姿 | `{ yaw?, pitch?, radius?, center? }`，省略字段保持原值；**逐个 setter 赋值时必须先 radius 后 pitch**（pitch 上限随 radius 变化），或直接用本函数 |
| `attachGeospatialControls(camera, canvas, scene, options?)` | 地球相机交互操控 | `options: { zoomToCursor?, checkCollisions? }`；左拖平移（光钉在球面）、中/右拖旋转、滚轮朝光标缩放、双指捏合、方向键/Ctrl+方向键/+−键盘、碰撞钳制不入地下；用户输入会中断进行中的飞行 |
| `flyGeospatialCameraToAsync(camera, scene, options)` | 飞行动画（Promise） | `{ yaw?, pitch?, radius?, center?, durationMs?, centerHopScale? }`；三次缓入缓出，yaw 走最短角路径，center 走大圆 slerp 可加抛物线 hop；同时只允许一次飞行 |
| `createGeospatialLimits(planetRadius)` / `getEffectivePitchMax` / `clampZoomDistance` | 地球相机限位 | 内部/低层；镜像 BJS 默认 `radiusMin=10`、`radiusMax=planetRadius·4`；拉远时 pitch 上限线性收敛到俯视 |
| `getViewMatrix` / `getProjectionMatrix(camera, aspect)` / `getViewProjectionMatrix` / `getCameraPosition` | 共享相机矩阵助手 | 自由函数（非方法）；fov/near/far 是普通可写字段，变更由 `_cameraChangeKey` 按值轮询捕获，无需手动标脏 |
| `Camera` interface / `OrthographicBounds` | 内部契约/数据结构 | 内部/低层：`{ fov, nearPlane, farPlane, viewport?, ortho?, worldMatrix, worldMatrixVersion }`；可手搓对象满足契约 |
| `createPickingRay` | 拾取射线（geospatial 用） | 地球拾取是解析射线-球面求交，不依赖网格拾取子系统（见 34 源页） |
| `useFloatingOrigin`（EngineOptions） | 大世界渲染 LWR 总开关 | `createEngine` 时设置；引擎级，所有场景继承；**必须同时 `useHighPrecisionMatrix: true`，否则同步 throw**；运行时模块动态 import，不开则零字节 |
| `getFloatingOriginOffset(scene)` | 读当前浮动原点偏移 | 返回活跃相机世界位置（无相机返回 0）；偏移即相机位置，不另存镜像 |

⚠️ **正交注意事项**：高斯泼溅（Gaussian splatting）与相机 gizmo 仍假设透视投影，**不支持**正交相机（见 02 源页）。LWR 下 clip planes、clustered 点光、背景地面/skybox 材质在 BJS 本身即退化，Lite 有意不接线（见 35 源页）。

## 最小示例

轨道相机 + 正交切换（裁剪自 02 源页官方示例）与 geospatial 用法（裁剪自 34 源页）：

```ts
import {
    createEngine, createSceneContext, addToScene, registerScene, startEngine,
    createArcRotateCamera, attachControl, enableOrthographicCamera, onBeforeRender,
} from "@babylonjs/lite";

const engine = await createEngine(canvas, { useFloatingOrigin: true, useHighPrecisionMatrix: true }); // 大世界（LWR）
const scene = createSceneContext(engine);

// 轨道相机：alpha 绕 Y，beta 极角，radius 距离
const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, 10, [0, 0, 0]);
scene.camera = camera;
attachControl(camera, canvas, scene);           // 返回 cleanup 函数

// 正交（opt-in）：返回的 bounds 是活跃对象，每帧改即生效
const ortho = enableOrthographicCamera(camera, { halfHeight: 6 });
onBeforeRender(scene, () => { ortho.halfHeight = 6 + Math.sin(t) * 2; }); // 正交"缩放"

// Geospatial 地球相机（参照 34 源页 Usage 示例结构）：
// const cam = createGeospatialCamera({ planetRadius: 100 });
// cam.farPlane = 100 * 16;
// setGeospatialOrientation(cam, { center: { x: 100, y: 0, z: 0 }, radius: 170, yaw: 0.6, pitch: 0.85 });
// scene.camera = cam;
// const dispose = attachGeospatialControls(cam, canvas, scene, { zoomToCursor: true });
// await flyGeospatialCameraToAsync(cam, scene, { yaw: 1.2, radius: 250, durationMs: 1500 });

await registerScene(scene);
await startEngine(engine);
```

## 相关效果

| 效果 | 关键 API | 原文档 |
| --- | --- | --- |
| 轨道相机 / 环绕观察 | `createArcRotateCamera` + `attachControl` | https://doc.babylonjs.com/lite/architecture/02-camera/ |
| 第一人称漫游 / WASD | `createFreeCamera` + `attachFreeControl` | 同上 |
| 正交 / 2.5D / 无透视 | `enableOrthographicCamera` / `disableOrthographicCamera` | 同上（#orthographicts--opt-in-orthographic-projection） |
| 正交缩放动画 | 动画路径 `"ortho.halfHeight"` | 同上（#changing-extents-at-runtime） |
| 导入 glTF 内嵌相机 | `enableGltfCameras()` → `AssetContainer.cameras`（见 04 主题） | 同上 |
| 地球仪 / 数字地球 | `createGeospatialCamera` + `setGeospatialOrientation` | https://doc.babylonjs.com/lite/architecture/34-geospatial-camera/ |
| 飞到某地 / 相机飞行 | `flyGeospatialCameraToAsync` | 同上（#fly-to-animation-geospatial-camera-flyts） |
| 大世界 / 千公里坐标无抖动 | `useFloatingOrigin: true`（需 `useHighPrecisionMatrix`） | https://doc.babylonjs.com/lite/architecture/35-large-world-rendering/ |
| 大世界 + Havok 物理 | `enableHavokFloatingOrigin(world)`（按需加载，多区域） | 同上（#wired-features） |
| 高精度矩阵基底 | 见 36 源页（LWR 前置依赖） | https://doc.babylonjs.com/lite/architecture/36-high-precision-matrix/ |
