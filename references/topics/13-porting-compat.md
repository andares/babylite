# 13 · 迁移与兼容（BJS→Lite / 兼容层 / Playground）

> **效果检索词**：BJS迁移/porting · 对照表/quick reference · 兼容层/lite-compat · 功能对比/feature comparison · Playground/在线运行/embed
> **源页快照**（skill 根相对路径，含完整源码级细节）：`references/raw-doc/02-feature-comparison.md` · `references/raw-doc/03-porting-guide.md` · `references/raw-doc/04-playground.md`

## API 范围

| API | 用途 | 要点 |
| --- | --- | --- |
| `@babylonjs/lite-compat`（npm 包） | BJS 形状兼容层 | opt-in，保留类式 API（`new WebGPUEngine`/`new Scene`/`MeshBuilder`/`StandardMaterial`…）；其 Vite/Rollup/Webpack/esbuild 插件可在**构建期改写**既有 `@babylonjs/core` 等 import；不支持的 API 抛 `LiteCompatError` 而非错误渲染。迁移路径：`@babylonjs/core → lite-compat → lite(native)`；新代码一律走原生 |
| `addToScene(scene, entity)` | 迁移第一坑：无自动注册 | BJS 构造器自动进场景；Lite 一切实体（mesh/light/transform node/`loadGltf` 资产容器）必须显式 add；`removeFromScene(scene, mesh)` 等价旧 `mesh.dispose()` 并释放 GPU 资源 |
| `await createEngine(canvas)` / `createSceneContext(engine)` / `await startEngine(engine)` | 引擎与渲染循环 | 替代 `new WebGPUEngine + initAsync + runRenderLoop`；**仅 WebGPU**，无 WebGL fallback，不可用即 throw |
| `createArcRotateCamera(α, β, r, target)` / `createFreeCamera(position, target)` / `createDefaultCamera(scene)` | 相机迁移 | 构造不再收 scene；`createDefaultCamera` 自动赋给 `scene.camera`（否则手动 `scene.camera = cam`） |
| `attachControl(camera, canvas, scene)` / `attachFreeControl(...)` | 相机操控独立函数 | 替代 `camera.attachControl(canvas, true)`；arc-rotate 与 free 各一个 |
| `enableOrthographicCamera(camera, { halfHeight })` | 正交投影 | 替代 `camera.mode = Camera.ORTHOGRAPHIC_CAMERA`；opt-in，bounds 可动画 |
| `createHemisphericLight([0,1,0], 1.0)` / `createDirectionalLight([0,-1,0])` / `createSpotLight(pos, dir, angle, exp)` | 灯光迁移 | 不收 scene；`Vector3/Color3` 换普通对象/数组（`light.diffuse = [1,0,0]`） |
| `createSphere(engine)` / `createBox(engine)` / `createGround(engine, opts)` | 网格工厂 | **收 engine 不收 scene**（GPU buffer 创建用），返回纯数据 mesh |
| `createStandardMaterial()` / `createPbrMaterial()` / `createGridMaterial(opts)` | 材质迁移 | 返回 props 对象，赋给 `mesh.material`；GridMaterial 替代 @babylonjs/materials 版 |
| `setStandardBumpTexture` / `setStandardEmissiveTexture` / `setStandardSpecularTexture` / `setStandardAmbientTexture` / `setStandardLightmapTexture` / `setStandardOpacityTexture` / `setStandardReflectionTexture` / `setStandardReflectionCubeTexture` | 标准材质可选贴图 | **opt-in setter**；只有 `diffuseTexture` 内置。直接赋 `_xxx` 底层字段是编译错误（`@internal`，会跳过扩展注册静默不渲染）；cube 反射需 `loadCubeTexture()` 产物。材质已构建后再设贴图仍需 `rebuildMaterial()` |
| `enableStandardVertexColors()` | 标准材质顶点色 | opt-in：RGBA 每顶点 4 float 紧凑 buffer + 调用一次，**在 registerScene 前**；PBR 顶点色自动 |
| `await enableMirroredMeshes(scene)` | 负缩放镜像网格 | opt-in：镜像 Standard/程序化网格时在资产 add 后、`registerScene()` 前调用一次；glTF 负缩放节点加载时已处理。管线侧 winding 解析进程级生效；运行时 watcher 只盯传入的 scene |
| `loadGltf` / `loadEnvironment` / `loadTexture2D` / `loadCubeTexture` / `loadKtxTexture2D` / `loadBasisTexture2D` / `loadBabylon` | 加载器迁移 | `loadGltf` 返回资产容器需 `addToScene`；`loadEnvironment` 内部自注册；KTX2 仅限 glTF `KHR_texture_basisu` 自动检测；`.babylon` 走 `loadBabylon()` 自动接好 setter |
| `light.shadowGenerator = createEsmDirectionalShadowGenerator(engine, light, opts)` / `createPcfSpotlightShadowGenerator` / `createPcfDirectionalShadowGenerator` | 阴影挂在灯上 | 替代独立 `new ShadowGenerator`；配 `setShadowTaskCasterMeshes(sg, [mesh])` + `await registerSceneWithShadowSupport(scene)` |
| `setThinInstances(mesh, data, count)` / `setThinInstanceColors(mesh, data)` | thin instance | 原始 `Float32Array`（列主序 4×4，每实例 16 float）；替代 `thinInstanceSetBuffer("matrix"/"color", …)`。BJS `InstancedMesh` API 🚫 不支持，一律用 thin instances |
| `mat4Identity()` | 数学工具 | `new Vector3 → {x,y,z}/[x,y,z]`、`new Color3 → [r,g,b]`、`Matrix.Identity() → mat4Identity()`；另有 Vec3/Mat4/Quaternion 工具函数与 Lite 特有 `ObservableVec3` |
| `onBeforeRender(scene, fn)` | 每帧回调 | 替代 `scene.onBeforeRenderObservable.add(fn)` |
| `markMaterialUboDirty(material)` / `enableMaterialTracking(mat)` | 材质属性动画 | 手动标脏（默认，~50B）或 opt-in 自动追踪（~1.5KB，能捕获 `color[0]=x`、`mat.alpha=x` 等就地写） |
| `disposeScene(scene)` / `disposeEngine(engine)` | 完整拆除 | 逐个删用 `removeFromScene`；全套拆除用这两个 |
| — 内部/低层：`StencilState`（`compare`/`passOp`/`failOp`/`depthFailOp`/`readMask`/`writeMask`）+ `enableMaterialStencil()` | 材质模板 | opt-in 且须在 `registerScene` 前启用，否则 `material.stencil` 字段无效 |
| — Playground postMessage 协议（非引擎 API） | 嵌入在线运行器 | 每条消息带 `channel: "babylon-lite-playground"`；命令 `loadCode`/`run`/`dispose`/`getCode`，事件 `ready`/`console`/`error`/`stats`/`ran`/`code`；**须等 `ready` 再发**，否则丢弃 |

⚠️ **功能差距速览（02 源页符号）**：✅=对等 · ⚡=子集（物理 Havok V2 子集、Sprite、Recast 导航） · —=未支持（GUI、粒子系统、Glow/SSAO/SSR、WebXR、OBJ/STL/FBX、程序化/视频/动态纹理、LOD、序列化等） · 🚫=设计上不做（WebGL、经典 InstancedMesh）。Lite ★ 领先项：100% tree-shakable、极小包体、零副作用、高精度/浮点原点矩阵。

## 最小示例

BJS→Lite 对照（官方 Porting Guide "Full Example" 裁剪）：

```ts
// ❌ Babylon.js: new WebGPUEngine + new Scene + ImportMeshAsync + runRenderLoop
// ✅ Babylon Lite（原生路径，官方示例原样）：
import { createEngine, createSceneContext, addToScene, loadGltf, loadEnvironment,
         createDefaultCamera, attachControl, createHemisphericLight, startEngine } from "@babylonjs/lite";

const engine = await createEngine(canvas);
const scene = createSceneContext(engine);

addToScene(scene, await loadGltf(engine, "BoomBox.glb"));   // 资产容器必须显式 add
await loadEnvironment(scene, envUrl, {                       // 内部自注册
    skyboxUrl: "skybox.dds", skyboxSize: 1000,
    groundTextureUrl: "ground.png", brdfUrl: "/brdf-lut.png",
});

const cam = createDefaultCamera(scene);                       // 自动赋 scene.camera
attachControl(cam, canvas, scene);
addToScene(scene, createHemisphericLight([0, 1, 0], 1.0));

await startEngine(engine);                                    // 替代 runRenderLoop
```

Playground 嵌入驱动（参照 04 源页 "A complete host example" 结构）：

```ts
// 等 ready 后发 loadCode；消息必须带 channel: "babylon-lite-playground"
frame.contentWindow.postMessage({ channel: "babylon-lite-playground", type: "loadCode", code: myCode, run: true }, "*");
```

## 相关效果

| 效果 | 关键 API | 原文档 |
| --- | --- | --- |
| BJS→Lite 逐条对照表（30+ 行） | `createEngine` / `createArcRotateCamera` / `setThinInstances` … | https://doc.babylonjs.com/lite/03-porting-guide/#quick-reference |
| 零改码兼容层（类式 API + 构建期 import 改写） | `@babylonjs/lite-compat`（抛 `LiteCompatError`） | https://doc.babylonjs.com/lite/03-porting-guide/ |
| 12 条关键差异（opt-in 清单） | `enableStandardVertexColors` / `enableMirroredMeshes` / setter 族 | https://doc.babylonjs.com/lite/03-porting-guide/#key-differences |
| glTF/KHR 扩展支持矩阵 | `loadGltf`（自动检测）/ `selectVariant` / `setDracoBaseUrl` | https://doc.babylonjs.com/lite/03-porting-guide/#gltf--pbr-extensions |
| 功能差距总表（✅⚡—🚫★） | —（纯对照表，无 API） | https://doc.babylonjs.com/lite/02-feature-comparison/ |
| 在线运行/多文件/npm 包/版本切换 | Playground 本体（非引擎 API） | https://doc.babylonjs.com/lite/04-playground/ |
| 嵌入 iframe + postMessage 驱动 | `loadCode`/`run`/`dispose`/`getCode` 命令协议 | https://doc.babylonjs.com/lite/04-playground/#embedding |
| 迁移后材质动画 | `markMaterialUboDirty` / `enableMaterialTracking`（见 05 主题） | https://doc.babylonjs.com/lite/03-porting-guide/#material-animation |
