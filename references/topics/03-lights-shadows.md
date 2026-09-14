# 03 · 灯光与阴影

> **效果检索词**：灯光 light · 半球光 hemispheric · 点光 point · 聚光 spot · 方向光/平行光 directional · 阴影 shadow · ESM 指数阴影图 exponential shadow map · PCF 百分比渐近过滤 · 级联阴影 CSM / cascaded · 阴影模糊 blur · 阴影偏移 bias · 静态阴影缓存
> **源页快照**（skill 根相对路径，含完整源码级细节）：`references/raw-doc/architecture/03-lights.md` · `references/raw-doc/architecture/16-shadow-generator.md` · `references/raw-doc/architecture/17-cascaded-shadow.md`

## API 范围

### 灯光（03 源页）

| API | 用途 | 要点 |
| --- | --- | --- |
| `createDirectionalLight(direction, intensity?)` | 方向光 | 返回 POJO，`lightType: 'directional'`；`direction`/`position` 为 `ObservableVec3`，`.set()` 或改 `.x` 自动触发脏追踪 |
| `createPointLight(position, intensity?)` | 点光 | `range` 默认 `Number.MAX_VALUE`；PBR 默认物理反平方衰减，`usePhysicalLightFalloff: false` 改用线性 range 衰减 |
| `createHemisphericLight(direction?, intensity?)` | 半球光/环境光 | `direction` 默认 `[0, 1, 0]`；`diffuseColor`/`specularColor`/`groundColor`（注意与点/聚/方向光的 `diffuse`/`specular` 命名不同） |
| `createSpotLight(position, direction, angle, exponent, intensity?)` | 聚光灯 | `angle` 为**全锥角（弧度）**；`exponent` 越大边缘越锐；`range` 默认 `Number.MAX_VALUE` |
| `light.excludedMeshIds` / `includedOnlyMeshIds` | 按网格排除/包含 | `ReadonlySet<string>`；每个网格的实际受光列表由 mesh UBO 的 `lc`/`li` 索引决定 |
| `light.shadowGenerator` | 给灯挂阴影 | 直接赋值属性（等价 BJS `light.getShadowGenerator()`），配合 `setShadowTaskCasterMeshes` 使用 |
| `setMaxLights(n)` / `MAX_LIGHTS` | 场景灯光容量上限（内部/低层） | 默认 `MAX_LIGHTS = 16`，是**场景级**总容量（BJS 是每材质 4）；必须在管线/UBO 创建前调整，改动会触发灯光 UBO 重建 |
| `ObservableVec3`（`light-base.ts` 再导出） | 可观察向量（内部/低层） | 替代 BJS `Vector3` + `_markAsDirty()`；setter → `wm.markLocalDirty()` → `worldMatrixVersion++` |

⚠️ **心智模型**：Lite 灯是无场景引用的纯数据对象（POJO + world-matrix 访问器），用 `lightType` 字符串判别类型；
灯与阴影的 caster 列表分离——灯只挂 `shadowGenerator`，caster 网格注册给 `ShadowTask` 输入。

### 阴影（16 / 17 源页）

| API | 用途 | 要点 |
| --- | --- | --- |
| `createEsmDirectionalShadowGenerator(engine, light, cfg?)` | 方向光 ESM 阴影（模糊软阴影） | cfg：`mapSize`(1024) / `depthScale`(50) / `bias`(0.00005) / `blurScale`(2) / `darkness` / `frustumEdgeFalloff` / `orthoMinZ`(1) / `orthoMaxZ`(10000) / `forceRefreshEveryFrame`；等价 BJS `useBlurExponentialShadowMap + useKernelBlur(blurKernel=64)`，每帧 3 pass（深度+横糊+竖糊） |
| `createPcfSpotlightShadowGenerator(engine, light, cfg?)` | 聚光灯 PCF 阴影 | cfg：`mapSize`(512) / `bias`(0.00005) / `darkness` / `normalBias` / `near`(1) / `far`(light.range 或 10000)；5×5 双线性 PCF，单 pass 无模糊，比 ESM 省 2 draw call + 2 纹理 |
| `createPcfDirectionalShadowGenerator(engine, light, cfg?)` | 方向光 PCF 阴影 | cfg 同上（无 near/far，有 `orthoMinZ`/`orthoMaxZ`）；等价 BJS `usePercentageCloserFiltering = true` |
| `createCsmDirectionalShadowGenerator(engine, light, cfg?)` | 方向光级联阴影 CSM | cfg：`mapSize`(1024) / `numCascades`(4, **max 4**) / `lambda`(0.5 log/uniform 混合) / `cascadeBlendPercentage`(0.1 级联交叉淡化, 0 关) / `stabilizeCascades`(包围球拟合防闪烁) / `shadowMaxZ` / `bias` / `worldSpaceBias` / `darkness` / `frustumEdgeFalloff`；对应 BJS `CascadedShadowGenerator`（默认 PCF5）；v1 仅 Standard 材质接收，PBR/Node 忽略 CSM |
| `setShadowTaskCasterMeshes(shadowGenerator, casterMeshes)` | 注册投影物（caster）列表 | **必调**；caster 是场景级 ShadowTask 输入，不在 generator 上；换 caster 集需重新传入新数组实例 |
| `registerSceneWithShadowSupport(scene)` | 带阴影的场景注册 | **替代 `registerScene()`**；opt-in 安装内部 ShadowTask，普通场景不打包阴影调度代码 |
| `mesh.receiveShadows = true` | 网格接收阴影 | 接收侧开关 |
| `setShadowCasterMaxCascade(mesh, maxCascade)` | 限制 caster 只投到级联 0..maxCascade | 仅 CSM 有效（ESM/单图 PCF 忽略）；`0` 为最近级联；传 `Infinity` 恢复默认；需在重新提供 caster 数组时生效 |
| `enableCsmStaticCache(engine, shadowGenerator, { refitAngle, refitMaxIntervalMs? })` | CSM 静态阴影缓存 | `await`；**必须在场景注册或取接收纹理之前启用**；静态 caster 120 安静帧后入缓存，灯漂移/相机变/超时触发 refit |
| `getCsmReceiverTexture(shadowGenerator)` | 自定义 ShaderMaterial 接收 CSM | 仅接受 CSM generator（ESM/PCF 抛错）；返回借用 `Texture2D`（2d-array 深度视图），勿独立释放 |
| `onCsmReceiverUpdate(shadowGenerator, cb)` | 订阅接收 UBO 更新 | 回调收到 80-float 接收布局；晚订阅会立即重放最近一次数据；返回取消函数 |
| `createCsmRefitGate(options)` | CPU 侧静态/动态分区与 refit 策略（内部/低层） | 无引擎/WebGPU 依赖；`CsmRefitGateOptions`: `refitAngle` / `refitMaxIntervalMs` / `demoteQuietFrames` |
| `ShadowGenerator` 接口 / `writeShadowUboFields()` / `buildLightViewMatrix()` 等 | 内部/低层 | `_shadowType: "esm"|"pcf"|"csm"`、`_depthTexture`、`_lightMatrix`、`_version` 脏追踪；shadow-base 共享数学/UBO 打包 |

## 最小示例

CSM 官方用法（裁剪自 17 源页，ESM/PCF 只需换工厂函数）：

```ts
import {
    createEngine, createSceneContext, createDirectionalLight,
    createCsmDirectionalShadowGenerator,            // 或 createEsmDirectionalShadowGenerator / createPcfDirectionalShadowGenerator
    setShadowTaskCasterMeshes, addToScene, registerSceneWithShadowSupport, startEngine,
} from "@babylonjs/lite";

const engine = await createEngine(canvas);
const scene = createSceneContext(engine);

const light = createDirectionalLight([0, -1, -1], 0.8);
addToScene(scene, light);

light.shadowGenerator = createCsmDirectionalShadowGenerator(engine, light, { mapSize: 1024 });
setShadowTaskCasterMeshes(light.shadowGenerator, casterMeshes);
// 接收侧：casterMeshes 之外的地板等网格设 mesh.receiveShadows = true

await registerSceneWithShadowSupport(scene);   // 注意：不是 registerScene
await startEngine(engine);
```

灯光创建/变更（裁剪自 03 源页）：

```ts
const spot = createSpotLight([0, 10, 0], [0, -1, 0], Math.PI / 3, 2.0, 1.5);
spot.angle = Math.PI / 4;

const hemi = createHemisphericLight([0, 1, 0], 0.7);
hemi.groundColor = [0.1, 0.1, 0.1];

const dir = createDirectionalLight([0, -1, 0], 1.5);
dir.position.set(10, 20, 10);   // ObservableVec3 → 自动标脏，阴影矩阵随之重算
```

## 相关效果

| 效果 | 关键 API | 原文档 |
| --- | --- | --- |
| 柔和模糊阴影（方向光） | `createEsmDirectionalShadowGenerator`（blurScale/kernelBlur） | https://doc.babylonjs.com/lite/architecture/16-shadow-generator/ |
| 硬阴影省资源（点少 draw call） | `createPcfDirectionalShadowGenerator` / `createPcfSpotlightShadowGenerator` | 同上 |
| 大场景高质量方向光影 | `createCsmDirectionalShadowGenerator` + `setShadowCasterMaxCascade` | https://doc.babylonjs.com/lite/architecture/17-cascaded-shadow/ |
| 静态场景阴影省帧 | `enableCsmStaticCache`（refitAngle / refitMaxIntervalMs） | 同上 |
| 自定义 shader 接收 CSM | `getCsmReceiverTexture` + `onCsmReceiverUpdate` | 同上 |
| 半球环境光 | `createHemisphericLight` + `groundColor` | https://doc.babylonjs.com/lite/architecture/03-lights/ |
| 灯光排除某网格 | `light.excludedMeshIds` / `includedOnlyMeshIds` | 同上 |
| 超过 16 盏灯 | `setMaxLights(n)`（须在管线创建前） | 同上 |
| 动态/GPU 形变 caster | cfg `forceRefreshEveryFrame: true` | https://doc.babylonjs.com/lite/architecture/16-shadow-generator/ |
| 材质接收阴影配置 | 见 05 主题（PBR/Standard 材质） | https://doc.babylonjs.com/lite/architecture/06-pbr-material/ |
