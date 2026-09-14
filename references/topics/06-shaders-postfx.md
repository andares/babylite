# 06 · 着色器与屏幕后处理

> **效果检索词**：shader 组合/自定义材质 custom shader/WGSL · 渲染管线 render pipeline · 帧图 frame graph · 后处理 post-process/后效 · 屏幕空间效果 screen space/接触阴影 contact shadows/SSGI 全局光照 · 材质插件 material plugin · G-buffer/几何渲染 geometry renderer · 全屏效果 fullscreen effect · 泛光 bloom/模糊 blur/色差 chromatic aberration · 异步管线编译
> **源页快照**（skill 根相对路径，含完整源码级细节）：`references/raw-doc/architecture/23-shader-composition.md` · `references/raw-doc/architecture/24-shader-material.md` · `references/raw-doc/architecture/26-material-plugin.md` · `references/raw-doc/architecture/27-render-pipeline.md` · `references/raw-doc/architecture/28-frame-graph.md` · `references/raw-doc/architecture/29-post-process.md` · `references/raw-doc/architecture/30-effect-renderer.md` · `references/raw-doc/architecture/31-geometry-renderer.md` · `references/raw-doc/architecture/52-screen-space-effects.md` · `references/raw-doc/architecture/53-async-shader-pipeline-compilation.md`

## API 范围

### 自定义着色器材质（用户级）

| API | 用途 | 要点 |
| --- | --- | --- |
| `createShaderMaterial(options)` | 手写 WGSL 材质 | **仅 WGSL**，无 GLSL/`Effect.ShadersStore`；同步工厂；`attributes` 顺序 = 顶点缓冲绑定与 `@location` 顺序（仅支持 `position/normal/uv/uv2/tangent/color`）；入口函数 `mainVertex`/`mainFragment` 需完整定义 |
| — options 关键项 | `vertexSource`/`fragmentSource`/`attributes` 必填 | `uniforms`（系统 uniform 用字符串名，自定义必须 `{ name, type }`）；`samplers`；`defines`（WGSL 无预处理器，转为 const 声明）；`needAlphaBlending`/`blendMode`/`needAlphaTesting`（hint，shader 需自行 `discard`）；`useThinInstanceColors`（默认 true） |
| `setShaderUniform(material, name, value)` | 写自定义 uniform | 校验名称/类型/分量数；另有便捷 `setShaderFloat`/`setShaderVector3`/`setShaderMatrix` |
| `setShaderTexture(material, name, texture)` | 绑定纹理 | 接受 `Texture2D \| null`；变更后触发 group-1 绑定组重建 |
| `enableShaderMaterialUniformCaching()` | 进程级 opt-in | 多 ShaderMaterial 场景的 UBO 序列化缓存；**须在 registerScene 前调用** |
| `enableShaderUniformRangeUpdates(scene, material)` | 大 UBO 局部上传 opt-in | 只传变化字节的 4 字节对齐范围；幂等 |
| `enableMaterialPlugins(scene)` | 材质插件 opt-in 入口 | 在创建材质/网格后、**registerScene 前**调用；是唯一加载插件桥接代码的调用 |
| `material.plugins = [plugin]` | 挂载 `MaterialPlugin` 纯数据对象 | 每实例挂载（无 BJS 全局 `RegisterMaterialPlugin`）；插件为 PBR/Standard 叠加 WGSL+uniform+采样器，保留完整内置光照/IBL/阴影；注入点 `MaterialPluginPoint`（如 `CUSTOM_FRAGMENT_BEFORE_FRAGCOLOR` → `BC` slot）；改 `isEnabled` 后 Standard 用 `bakeStdPluginMaterial(material, scene)` 重烘焙 |
| `enableAsyncShaderPipelineCompilation(engine)` | ShaderMaterial 管线预编译 opt-in | 幂等；把 WebGPU 管线编译移出首次同步 bind；须在渲染对象构建前调用；另有显式 `prepareShaderMaterialPipeline` / `prepareShaderMaterialPipelineForTask`（layout: `"mesh" \| "thin-instances" \| "thin-instances-color"`） |

### 渲染管线 / 帧图（低层任务编排）

| API | 用途 | 要点 |
| --- | --- | --- |
| `getFrameGraph(scene)` | 取场景帧图 | 帧图 = **有序任务列表**（非 DAG）；生产者任务必须排在消费者之前 |
| `addTask` / `addTaskAtStart` / `addTaskBefore` / `addTaskAfter` | 插入任务 | 运行期插入后需在下帧前重建图；`addMesh()` 早于 registerScene 时 build 也要推迟到 registerScene 后 |
| `createRenderTarget(descriptor)` | 渲染目标描述符 | `colorFormat`/`depthStencilFormat`/`sampleCount`(1或4)/`size: "canvas"\|{width,height}`/`resolveToSwapchain`；swapchain 任务用 `resolveToSwapchain: true`；离屏 RT 自动 Y 翻转（`flipY` 可覆盖） |
| `createRenderTargetTexture(engine, descriptor)` | 及早分配 RTT | 返回 `{ rt, texture }`，texture 为 `Texture2D` 可先绑进材质；size 必须固定值，不可 `"canvas"` |
| `createRenderTask(config, engine, scene)` | 场景渲染任务 | config：`rt`、`clrColor`、`clr:false`(叠加/多场景)、`depthClear:false`、`sharedRt:true`(共享早任务目标)、`cam`(每 pass 相机)、`cs:true`(RTT 用画布宽高比)、`autoMirror:false`(显式渲染列表)、`transmission:{copyCount,generateMipmaps}`；`task.addMesh(mesh, { material })` 可用源材质或 `MaterialView` 覆盖；后处理管线用 `createSceneContext(engine, { defaultRenderTask: false })` 关掉默认任务避免画两遍 |
| `removeMeshFromTask(task, mesh)` | 从任务移除网格 | 场景移除时内部调用 |
| `createMaterialView(source, renderFeatures)` | 每通道材质变体 | 原型继承源材质，只换渲染 feature 位（如阴影/几何输出的无色变体）；配合 `rebuildMaterial`/`markMaterialUboDirty` |
| `isPbrMaterial` / `isStandardMaterial` / `isShaderMaterial` / `isNodeMaterial` / `getMaterialFamily` | 材质家族判别 | 类型守卫，tree-shakable |
| `composeShader(template, fragments)` | 内部/低层：fragment 组合器 | `ShaderFragment[]` 拓扑排序 + slot 注入（`/*AI*/` 等）→ WGSL + 管线描述符；材料拥有 shader，组合器是纯函数；相关类型 `ShaderFragment`/`ShaderTemplate`/`UboField`；`computeUboLayout()` 算 std140 对齐 |
| `measureRenderTaskOverdrawCost(engine, task)` | 诊断：过度绘制探针 | 需 `timestamp-query` feature；仅诊断用，勿在生产帧循环调用 |
| `registerSceneWithShadowSupport(scene)` | 阴影任务适配器 | 在默认 "scene" 任务前插入内部 ShadowTask（普通 `registerScene` 不含阴影） |

### 后处理与屏幕空间任务（用户级工厂）

| API | 用途 | 要点 |
| --- | --- | --- |
| `createPostProcessTask(config, engine, scene?)` | 通用后处理任务 | 源 `sourceTexture` 为 `RenderTarget`；可选 `targetTexture`(缺省内部自建)/`sourceSamplingMode`("nearest"/"linear")/`alphaMode`(0/1/2/7)/`viewport`/`clear`；用户 WGSL 定义 `applyPostProcess(color, uv)`；参数变更后调 `updateUniforms()` |
| `createBlackAndWhitePostProcessTask` / `createAnaglyphPostProcessTask` / `createBlurPostProcessTask` / `createExtractHighlightsPostProcessTask` / `createChromaticAberrationPostProcessTask` | 内置单项后处理 | BW:`degree`；anaglyph:`leftTexture`；blur:`direction {x,y}`+`kernel`；extract:`threshold`+`exposure`；CA:`aberrationAmount`/`direction`/`radialIntensity`/`centerPosition` |
| `createBloomPostProcessTask(config, engine, scene?)` | 复合泛光 | 内部 4 个 pass（提取高亮→水平/垂直高斯→合并）；`weight`/`kernel`/`threshold`/`exposure`/`bloomScale` |
| `createSmaaPostProcessTask()` | SMAA 抗锯齿 | 3 pass（边缘检测→权重→邻域混合）；源必须单采样；放在色调映射后链尾；参数 `threshold`/`maxSearchSteps`/`sourceIsSrgb` 等，改后调 `updateUniforms()` |
| `createImageProcessingTask(config, engine, scene)` | 全屏曝光/色调映射/对比度 | 读 `scene.imageProcessing.*`；透射管线的最终 swapchain pass 也用它 |
| `createFrameGraphContext(engine, options?)` | 无场景独立帧图 | `registerFrameGraphContext`/`unregisterFrameGraphContext`/`disposeFrameGraphContext` 管理；`update(deltaMs)` 回调每帧执行，适合更新效果 uniform |
| `createEffectWrapper(engine, options)` + `createEffectRenderer(engine, effect)` | 全屏直绘 swapchain 效果 | 无需 SceneContext/帧图；`setEffectUniforms`/`setEffectTexture` 传数据；`registerEffectRenderer` 注册；片段入口须为 `effectFragment` |
| `createEffectRenderTask(config, engine, scene)` | 离屏 RTT 效果任务 | `config: { name, effect, target, clear?, clearColor? }`；配合 `createRenderTargetTexture` 可把结果贴到场景材质 |
| `createUniformEffectWrapper` + `createUniformEffectRenderTask` | 仅一个 UBO 的精简全屏路径 | 无纹理/采样器绑定开销；`setUniformEffectUniforms` 写数据 |
| `createGeometryRendererTask(scene, config)` | G-buffer/MRT 几何任务 | `textureDescriptions: [{ type: GeometryTextureType.* }]`（最多 8 附件）；产出 `geometryViewNormalTexture`/`geometryWorldPositionTexture`/`geometryAlbedoTexture` 等（单附件 RT 包装，可直接喂后处理）；velocity 用 `excludeFromVelocity(mesh)`/`includeInVelocity(mesh)`；>2 个 rgba16float 附件需 `createEngine(canvas, { requiredLimits: { maxColorAttachmentBytesPerSample: 64 } })` |
| `GeometryTextureType` | 附件类型枚举 | `IRRADIANCE/WORLD_POSITION/LOCAL_POSITION/REFLECTIVITY/VIEW_DEPTH/NORMALIZED_VIEW_DEPTH/SCREENSPACE_DEPTH/VIEW_NORMAL/WORLD_NORMAL/ALBEDO/LINEAR_VELOCITY`（比 BJS 少 SQRT/屏速 VELOCITY 等变体） |
| `createCopyToTextureTask(scene, config)` | 纹理 blit/检查条 | 快路径 copyTextureToTexture，否则全屏三角形 blit；`viewport`/`lodLevel`/`resolveTexture` |
| `createScreenSpaceContactShadowsPostProcessTask(config, engine, scene?)` | 屏幕空间接触阴影 | 需单采样离屏 color+depth 源；`lightDirection`(Vec3)+`camera` 必填；`intensity`(默认0.6)/`maxDistance`/`thickness`/`temporalWeight` 等有夹取；组合目标 ≠ 源纹理（WebGPU 禁同纹理读写） |
| `createScreenSpaceGlobalIlluminationPostProcessTask(config, engine, scene?)` | 一跳屏幕空间 GI | `rayCount`(1-8)/`rayLength`/`colorBleedGain`/`colorBleedMax`；composition `"additive"`(默认)/`"color-bleed"`/`"none"`；默认半分辨率；`resetVersion` 递增重置时序历史 |

⚠️ **心智模型**：BJS 的 `DefaultRenderingPipeline`/相机挂 PostProcess 链在 Lite 不存在——后处理是**帧图任务**，用 `addTask` 按序串联；`ShaderMaterial` 只收 WGSL；无 `#define`（用 const + WGSL `if` 让编译器折叠）。

## 最小示例

后处理链（场景渲到离屏 → 泛光 → 写回画布；参照 28/29 源页结构）：

```ts
import {
    createEngine, createSceneContext, addToScene, registerScene, startEngine,
    createRenderTarget, createRenderTask, addTask,
    createBloomPostProcessTask,
} from "@babylonjs/lite";

const engine = await createEngine(canvas);
// 关闭默认 swapchain 任务，避免场景画两遍
const scene = createSceneContext(engine, { defaultRenderTask: false });
// …addToScene(scene, mesh/light/camera)…

// 离屏场景源（不 resolveToSwapchain，Y 自动翻转）
const sceneRT = createRenderTarget({
    colorFormat: engine.format, depthStencilFormat: "depth24plus-stencil8",
    sampleCount: 1, size: "canvas",
});
addTask(scene, createRenderTask({ name: "scene", rt: sceneRT }, engine, scene));

// 泛光：源 = sceneRT，targetTexture 省略则内部自建中间目标
const bloom = createBloomPostProcessTask(
    { sourceTexture: sceneRT, weight: 2, threshold: 0.1, kernel: 64, bloomScale: 0.5 },
    engine, scene,
);
addTask(scene, bloom);            // 生产者在消费者之前

await registerScene(scene);
await startEngine(engine);
```

（每 pass 相机/RTT 喂材质、材质插件、屏幕空间 GI 等完整示例见对应源页：28 页 "Usage: Offscreen Pass Feeding a Material"、26 页 opt-in 入口、52 页配置表。）

## 相关效果

| 效果 | 关键 API | 原文档 |
| --- | --- | --- |
| 手写 WGSL 材质（贴图/自定义 uniform/alpha） | `createShaderMaterial` + `setShaderUniform`/`setShaderTexture` | https://doc.babylonjs.com/lite/architecture/24-shader-material/ |
| 预编译 ShaderMaterial 管线（免首帧卡顿） | `enableAsyncShaderPipelineCompilation` / `prepareShaderMaterialPipeline` | https://doc.babylonjs.com/lite/architecture/53-async-shader-pipeline-compilation/ |
| 材质插件（灰度/描边等叠加到 PBR/Standard） | `enableMaterialPlugins` + `material.plugins` | https://doc.babylonjs.com/lite/architecture/26-material-plugin/ |
| 泛光 / 模糊 / 黑白 / 红蓝立体 / 色差 / 高亮提取 | `createBloomPostProcessTask` 等工厂族 | https://doc.babylonjs.com/lite/architecture/29-post-process/ |
| SMAA 抗锯齿 / 曝光色调映射 | `createSmaaPostProcessTask` / `createImageProcessingTask` | https://doc.babylonjs.com/lite/architecture/28-frame-graph/ |
| 程序化全屏效果（swapchain 直绘或 RTT） | `createEffectWrapper` + `createEffectRenderer` / `createEffectRenderTask` | https://doc.babylonjs.com/lite/architecture/30-effect-renderer/ |
| G-buffer / 法线/深度/反照率提取（SSAO/SSR 输入） | `createGeometryRendererTask` + `GeometryTextureType` | https://doc.babylonjs.com/lite/architecture/31-geometry-renderer/ |
| 屏幕空间接触阴影 / 屏幕空间 GI | `createScreenSpaceContactShadowsPostProcessTask` / `createScreenSpaceGlobalIlluminationPostProcessTask` | https://doc.babylonjs.com/lite/architecture/52-screen-space-effects/ |
| 离屏 RTT 贴到材质 / 每 pass 相机与材质覆盖 | `createRenderTargetTexture` + `RenderTask.addMesh(mesh, { material })` | https://doc.babylonjs.com/lite/architecture/28-frame-graph/ |
| 折射 / 透射（场景纹理采样） | `RenderTaskConfig.transmission` / `enableSceneTransmission` | https://doc.babylonjs.com/lite/architecture/28-frame-graph/ |
