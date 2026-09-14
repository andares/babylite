# Babylon Lite 效果速查 · 索引（第 1 跳）

> 用法见 [README.md](README.md)。检索方式：先想你要的**效果**，用关键词（中/英）在这里查行；
> 行内即有**关键 API 范围**和**原文档链接**；要看示例与细节再进对应主题文件（第 2 跳）。
> 表格按主题分组，行内"主题文件"即第 2 跳入口；
> 主题文件顶部还列出该主题的**原文快照**（`references/raw-doc/**`，第 3 跳，可 grep）。
> 本索引里的路径相对 skill base directory 或本文件所在目录（Markdown 链接）。

## 01 · 场景搭建与渲染循环

| 效果（检索词） | 关键 API 范围 | 主题文件 | 原文档 |
| --- | --- | --- | --- |
| 初始化引擎 / 起步 / engine setup | `await createEngine(canvas)` | [01-scene-setup.md](topics/01-scene-setup.md) | https://doc.babylonjs.com/lite/01-getting-started/ |
| 创建场景 / scene context | `createSceneContext(engine)`（纯数据对象，非类实例） | 同上 | https://doc.babylonjs.com/lite/architecture/01-scene/ |
| 添加/移除对象 / register entity | `addToScene(scene, entity)` / `removeFromScene(scene, entity)`（等价旧 `dispose()`） | 同上 | https://doc.babylonjs.com/lite/architecture/01-scene/ |
| 启动渲染循环 / render loop | `await registerScene(scene)`（所有 add 之后调一次）→ `await startEngine(engine)` | 同上 | https://doc.babylonjs.com/lite/architecture/22-engine/ |
| 每帧回调 / onBeforeRender | `onBeforeRender(scene, fn)` | 同上 | https://doc.babylonjs.com/lite/03-porting-guide/ |
| 显隐控制 / show hide 子树 | `setSubtreeVisible(node, false)`；父子层级 `createTransformNode` / `cloneTransformNode` | 同上 | https://doc.babylonjs.com/lite/architecture/11-scene-hierarchy-parenting/ |
| 引擎尺寸/生命周期 / resize dispose | `disposeScene(scene)` / `resizeEngine` / `setEngineSize` | 同上 | https://doc.babylonjs.com/lite/architecture/22-engine/ |
| GPU 时序分析 / timings | `waitForGpuIdle()` / `getRenderTaskGpuTimings()`（`setGpuTimingEnabled` 开启） | 同上 | https://doc.babylonjs.com/lite/architecture/22-engine/ |
| 错误码解码 / error code | `enableErrorDecoding()`（dev）/ `decodeError(err)`（生产按需） | 同上 | https://doc.babylonjs.com/lite/architecture/49-error-handling/ |

## 02 · 相机与操控

| 效果（检索词） | 关键 API 范围 | 主题文件 | 原文档 |
| --- | --- | --- | --- |
| 轨道相机 / 环绕观察 / orbit / ArcRotate | `createArcRotateCamera(alpha, beta, radius, target)` + `attachControl(camera, canvas, scene)` | [02-cameras-controls.md](topics/02-cameras-controls.md) | https://doc.babylonjs.com/lite/architecture/02-camera/ |
| 第一人称漫游 / WASD / free camera | `createFreeCamera(position, target)` + `attachFreeControl(camera, canvas, scene)` | 同上 | https://doc.babylonjs.com/lite/architecture/02-camera/ |
| 正交投影 / 2.5D / orthographic | `enableOrthographicCamera(camera, { halfHeight })` / `disableOrthographicCamera(camera)`；缩放动画路径 `"ortho.halfHeight"` | 同上 | https://doc.babylonjs.com/lite/architecture/02-camera/ |
| 地球仪 / 数字地球 / geospatial / ECEF | `createGeospatialCamera({ planetRadius })` + `setGeospatialOrientation(camera, { yaw, pitch, radius, center })` | 同上 | https://doc.babylonjs.com/lite/architecture/34-geospatial-camera/ |
| 地球相机交互 / 缩放到光标 | `attachGeospatialControls(camera, canvas, scene, { zoomToCursor })` | 同上 | https://doc.babylonjs.com/lite/architecture/34-geospatial-camera/ |
| 相机飞行 / fly to 飞到某地 | `flyGeospatialCameraToAsync(camera, scene, { yaw, pitch, radius, center, durationMs })` | 同上 | https://doc.babylonjs.com/lite/architecture/34-geospatial-camera/ |
| 大世界 / 浮动原点 / large world / LWR | `createEngine(canvas, { useFloatingOrigin: true, useHighPrecisionMatrix: true })`；读偏移 `getFloatingOriginOffset(scene)` | 同上 | https://doc.babylonjs.com/lite/architecture/35-large-world-rendering/ |
| 相机矩阵手算 / view projection | `getViewMatrix` / `getProjectionMatrix(camera, aspect)` / `getViewProjectionMatrix` / `getCameraPosition` | 同上 | https://doc.babylonjs.com/lite/architecture/02-camera/ |
| glTF 内嵌相机导入 | `enableGltfCameras()` → `AssetContainer.cameras`（见 04 主题） | 同上 | https://doc.babylonjs.com/lite/architecture/04-loaders/ |

## 03 · 灯光与阴影

| 效果（检索词） | 关键 API 范围 | 主题文件 | 原文档 |
| --- | --- | --- | --- |
| 方向光/平行光 / directional light | `createDirectionalLight(direction, intensity)` | [03-lights-shadows.md](topics/03-lights-shadows.md) | https://doc.babylonjs.com/lite/architecture/03-lights/ |
| 点光 / point light | `createPointLight(position, intensity)`；线性衰减 `usePhysicalLightFalloff: false` | 同上 | https://doc.babylonjs.com/lite/architecture/03-lights/ |
| 半球环境光 / hemispheric / ambient | `createHemisphericLight(direction, intensity)` + `groundColor` | 同上 | https://doc.babylonjs.com/lite/architecture/03-lights/ |
| 聚光灯 / spotlight | `createSpotLight(position, direction, angle, exponent, intensity)`（angle 为全锥角弧度） | 同上 | https://doc.babylonjs.com/lite/architecture/03-lights/ |
| 柔和模糊阴影 / ESM / soft shadow | `createEsmDirectionalShadowGenerator(engine, light, { blurScale, depthScale })` | 同上 | https://doc.babylonjs.com/lite/architecture/16-shadow-generator/ |
| 硬阴影省资源 / PCF shadow | `createPcfDirectionalShadowGenerator` / `createPcfSpotlightShadowGenerator`（5×5 PCF 单 pass） | 同上 | https://doc.babylonjs.com/lite/architecture/16-shadow-generator/ |
| 级联阴影 / CSM / cascaded | `createCsmDirectionalShadowGenerator(engine, light, { numCascades, lambda, cascadeBlendPercentage })`；限投 `setShadowCasterMaxCascade(mesh, maxCascade)` | 同上 | https://doc.babylonjs.com/lite/architecture/17-cascaded-shadow/ |
| 投影物注册 / shadow caster | `setShadowTaskCasterMeshes(shadowGenerator, casterMeshes)`（必调）+ 接收侧 `mesh.receiveShadows = true`；场景注册用 `registerSceneWithShadowSupport(scene)` 替代 `registerScene` | 同上 | https://doc.babylonjs.com/lite/architecture/17-cascaded-shadow/ |
| 静态阴影缓存省帧 | `enableCsmStaticCache(engine, shadowGenerator, { refitAngle })`（须在场景注册前） | 同上 | https://doc.babylonjs.com/lite/architecture/17-cascaded-shadow/ |
| 灯光排除网格 / 超 16 盏灯 | `light.excludedMeshIds` / `includedOnlyMeshIds`；`setMaxLights(n)`（管线创建前） | 同上 | https://doc.babylonjs.com/lite/architecture/03-lights/ |

## 04 · 模型与环境加载

| 效果（检索词） | 关键 API 范围 | 主题文件 | 原文档 |
| --- | --- | --- | --- |
| 加载 glTF/GLB 模型 / model loading | `await loadGltf(engine, source)`（收 engine 非 scene）→ `addToScene(scene, assetContainer)` | [04-loading-assets.md](topics/04-loading-assets.md) | https://doc.babylonjs.com/lite/architecture/04-loaders/ |
| glTF 内嵌相机 / KHR 变体 | `enableGltfCameras()`；材质变体 `selectVariant()` / `getVariantNames()` | 同上 | https://doc.babylonjs.com/lite/architecture/04-loaders/ |
| Draco / meshopt 压缩模型 | 自动触发 + `setDracoBaseUrl(url)` / `setMeshoptBaseUrl(url)`（加载前调） | 同上 | https://doc.babylonjs.com/lite/architecture/04-loaders/ |
| .env 环境贴图 / IBL | `await loadEnvironment(scene, url, { brdfUrl /* 必填 */, groundTextureUrl, skipSkybox })` | 同上 | https://doc.babylonjs.com/lite/architecture/04-loaders/ |
| .hdr 全景环境 / HDR / IBL | `await loadHdrEnvironment(scene, url, { useCubemapSkybox, faceSize })`；DDS 用 `loadDdsEnvironment` | 同上 | https://doc.babylonjs.com/lite/architecture/19-loader-hdr/ |
| 天空盒 / 背景 / skybox / background | `loadHdrEnvironment({ useCubemapSkybox })` / `loadSkybox(scene, baseUrl, ext, size)` | 同上 | https://doc.babylonjs.com/lite/architecture/05-background-skybox/ |
| 默认地面（半透明+菲涅尔） | `loadEnvironment` 的 `groundTextureUrl` / `skipGround` | 同上 | https://doc.babylonjs.com/lite/architecture/05-background-skybox/ |
| 加载 .babylon 场景 | `await loadBabylon(engine, url, { loadTextures })` + `addToScene`（不支持骨骼/动画/morph） | 同上 | https://doc.babylonjs.com/lite/architecture/20-loader-babylon/ |
| 单张贴图 / Texture2D / KTX 压缩 | `await loadTexture2D(engine, url, { srgb })` / `loadKtxTexture2D(engine, baseUrl, suffixes)` | 同上 | https://doc.babylonjs.com/lite/architecture/09-texture-2d/ |

## 05 · 材质与渲染效果（PBR / 标准材质）

| 效果（检索词） | 关键 API 范围 | 主题文件 | 原文档 |
| --- | --- | --- | --- |
| **次表面散射** / 皮肤 / 蜡 / 玉石半透明 / subsurface / SSS | `createPbrMaterial(props)` + `props.subsurface.scattering{ diffusionDistance, metersPerUnit }` | [05-materials-pbr.md](topics/05-materials-pbr.md) | https://doc.babylonjs.com/lite/architecture/06-pbr-material/ |
| 半透明透射 / 叶片 / 窗帘背光 / translucency | `createPbrMaterial` + `props.subsurface.translucency{ intensity, color, diffusionDistance }` | 同上 | https://doc.babylonjs.com/lite/architecture/06-pbr-material/ |
| PBR 金属/粗糙/贴图 / metallic roughness ORM | `createPbrMaterial` + `baseColorTexture / normalTexture / ormTexture / metallicFactor / roughnessFactor` | 同上 | https://doc.babylonjs.com/lite/architecture/06-pbr-material/ |
| 清漆 / 汽车漆 / clearcoat | `createPbrMaterial` + `clearCoat{ intensity, roughness, indexOfRefraction }` | 同上 | https://doc.babylonjs.com/lite/architecture/06-pbr-material/ |
| 织物绒毛 / 天鹅绒 / sheen | `createPbrMaterial` + `sheen{ color, roughness, intensity }` | 同上 | https://doc.babylonjs.com/lite/architecture/06-pbr-material/ |
| 各向异性 / 金属拉丝 / 光盘 / anisotropy | `createPbrMaterial` + `anisotropy{ intensity, direction }` | 同上 | https://doc.babylonjs.com/lite/architecture/06-pbr-material/ |
| 自发光 / emissive | `setPbrEmissive(material, color)`（勿直接赋 `_emissiveColor`）；材质变更 `markMaterialUboDirty` / `rebuildMaterial` | 同上 | https://doc.babylonjs.com/lite/architecture/06-pbr-material/ |
| 标准材质贴图（凹凸/自发光/立方反射） | `createStandardMaterial()` + `setStandardBumpTexture / setStandardEmissiveTexture / setStandardReflectionCubeTexture`（opt-in setter） | 同上 | https://doc.babylonjs.com/lite/architecture/08-standard-material/ |
| 网格检查材质 / grid | `createGridMaterial(opts)` | 同上 | https://doc.babylonjs.com/lite/architecture/25-grid-material/ |
| 模板测试 / stencil 遮罩描边 | `enableMaterialStencil()`（registerScene 前）；半透明抗锯齿边缘 alpha-to-coverage 用 `setAlphaToCoverage`（见 10 主题） | 同上 | https://doc.babylonjs.com/lite/architecture/40-material-stencil/ |

## 06 · 着色器与屏幕后处理

| 效果（检索词） | 关键 API 范围 | 主题文件 | 原文档 |
| --- | --- | --- | --- |
| 手写 WGSL 自定义材质 / custom shader | `createShaderMaterial({ vertexSource, fragmentSource, attributes })` + `setShaderUniform` / `setShaderTexture` | [06-shaders-postfx.md](topics/06-shaders-postfx.md) | https://doc.babylonjs.com/lite/architecture/24-shader-material/ |
| 管线预编译免首帧卡顿 / async compilation | `enableAsyncShaderPipelineCompilation(engine)` / `prepareShaderMaterialPipeline(material, layout)` | 同上 | https://doc.babylonjs.com/lite/architecture/53-async-shader-pipeline-compilation/ |
| 材质插件（叠加到 PBR/Standard） | `enableMaterialPlugins(scene)` + `material.plugins = [plugin]` | 同上 | https://doc.babylonjs.com/lite/architecture/26-material-plugin/ |
| 渲染管线 / 帧图任务 / render pipeline / frame graph | `getFrameGraph(scene)` + `addTask` / `addTaskBefore`；离屏 `createRenderTarget({ size: "canvas" })` + `createRenderTask(config, engine, scene)`；每 pass 材质覆盖 `task.addMesh(mesh, { material })` / `createMaterialView` | 同上 | https://doc.babylonjs.com/lite/architecture/28-frame-graph/ |
| 泛光 / bloom / 模糊 / 黑白 / 色差 / 后处理 | `createBloomPostProcessTask` / `createBlurPostProcessTask` / `createBlackAndWhitePostProcessTask` / `createChromaticAberrationPostProcessTask`；通用 `createPostProcessTask`（用户 WGSL `applyPostProcess`） | 同上 | https://doc.babylonjs.com/lite/architecture/29-post-process/ |
| SMAA 抗锯齿 / 曝光色调映射 | `createSmaaPostProcessTask()` / `createImageProcessingTask(config, engine, scene)` | 同上 | https://doc.babylonjs.com/lite/architecture/28-frame-graph/ |
| 程序化全屏效果 / fullscreen effect | `createEffectWrapper(engine, options)` + `createEffectRenderer(engine, effect)`；离屏 RTT 用 `createEffectRenderTask` / `createRenderTargetTexture` | 同上 | https://doc.babylonjs.com/lite/architecture/30-effect-renderer/ |
| G-buffer / 法线深度提取（SSAO/SSR 输入） | `createGeometryRendererTask(scene, config)` + `GeometryTextureType`（`WORLD_NORMAL` / `ALBEDO` / `SCREENSPACE_DEPTH`…） | 同上 | https://doc.babylonjs.com/lite/architecture/31-geometry-renderer/ |
| 屏幕空间接触阴影 / SSGI / screen space | `createScreenSpaceContactShadowsPostProcessTask(config, engine, scene)` / `createScreenSpaceGlobalIlluminationPostProcessTask` | 同上 | https://doc.babylonjs.com/lite/architecture/52-screen-space-effects/ |

## 07 · 动画（Animation / Skeleton / Morph / VAT）

| 效果（检索词） | 关键 API 范围 | 主题文件 | 原文档 |
| --- | --- | --- | --- |
| 动画管理器 / 播放控制 / animation group | `createAnimationManager({ engine })` + `addAnimationGroups(m, groups)` / `playAnimation(g)` / `pauseAnimation(g)` / `goToFrame(group, f)` | [07-animation.md](topics/07-animation.md) | https://doc.babylonjs.com/lite/architecture/07-animation/ |
| 权重混合 / walk run 融合 / weight blending | `setAnimationWeight(group, weight)` + `enableAnimationBlending(m)`（glTF 骨骼）/ `enablePropertyAnimationBlending(m)`（手写属性） | 同上 | https://doc.babylonjs.com/lite/architecture/07-animation/#gltf-skeleton-weight-mixing |
| 平滑切换 / 交叉渐变 / cross fade | `crossFadeAnimationGroups(m, from, to, { durationMs })` / `fadeAnimationWeight(m, g, { to, durationMs })` | 同上 | https://doc.babylonjs.com/lite/architecture/07-animation/ |
| 叠加层 / additive layer | `setAnimationAdditive(g, { referenceFrame })` | 同上 | https://doc.babylonjs.com/lite/architecture/07-animation/ |
| 半身动画 / 骨骼掩码 / mask | `createAnimationGroupMask(names, AnimationGroupMaskMode.Include/Exclude)` → `group.mask` | 同上 | https://doc.babylonjs.com/lite/architecture/07-animation/#animationgroupmask |
| 手写关键帧动画 / keyframe | `createPropertyAnimationClip(name, tracks)` + `createPropertyAnimationGroup(m, target, clip, opts)`（path 如 `"position.x"`、`"ortho.halfHeight"`） | 同上 | https://doc.babylonjs.com/lite/architecture/07-animation/#usage-examples |
| 单骨骼控制 / 隐藏骨骼子树 / bone control | `enableBoneControl()`（加载前）+ `getBoneByName` / `setBonePosition` / `clearBoneOverride` / `setBoneVisible` | 同上 | https://doc.babylonjs.com/lite/architecture/13-skeleton/#bone-control-opt-in |
| 表情 / 口型 / morph targets / blend shapes | glTF `PATH_WEIGHTS` 通道自动驱动（max 4 targets，仅 PBR） | 同上 | https://doc.babylonjs.com/lite/architecture/14-morph-targets/ |
| 人群 / GPU 实例化动画 / VAT / crowd | `bakeVat(engine, mesh, groups)` + `attachVat(engine, mesh, baked, clip)` + `setInstancesBlend`；离线 `prepareVat` + `createVatBakeResult` | 同上 | https://doc.babylonjs.com/lite/architecture/15-vertex-animation-texture/ |
| 确定性动画测试 / parity | `engine._fixedDeltaMs` + `engine.pauseAnimations()` + freeze 协议 | 同上 | https://doc.babylonjs.com/lite/architecture/39-animation-parity-testing/ |

## 08 · 网格、几何与数学

| 效果（检索词） | 关键 API 范围 | 主题文件 | 原文档 |
| --- | --- | --- | --- |
| 高度图地形 / heightmap terrain | `createGroundFromHeightMap(url, opts)` / `createFlatGroundData(opts)`；`applyHeightmap()` 手动位移 | [08-meshes-geometry.md](topics/08-meshes-geometry.md) | https://doc.babylonjs.com/lite/architecture/10-mesh-generators/ |
| 几何体生成 / 盒球柱环面 / mesh generator | `createSphereData`+`uploadSphereToGPU` / `createBoxData` / `createCylinderData`（`diameterTop:0` 得锥）等 → `createMeshFromData` | 同上 | https://doc.babylonjs.com/lite/architecture/10-mesh-generators/ |
| 管/挤出/条带造型 / tube ribbon extrude | `createTubeData({ path, radius, cap: CAP_ALL })` / `createExtrudeShapeData` / `createRibbonData` / `createPolyhedronData` | 同上 | https://doc.babylonjs.com/lite/architecture/10-mesh-generators/ |
| 父子层级 / 挂载换父 / parenting setParent | `createTransformNode(name)` / `setParent(child, parent)`（保持世界变换）；读 `mesh.worldMatrix` | 同上 | https://doc.babylonjs.com/lite/architecture/11-scene-hierarchy-parenting/ |
| 大规模实例 / 人群 / thin instances / instancing | `setThinInstances(mesh, matrices, count)` + `addThinInstance` / `removeThinInstance` / `flushThinInstances`；每实例色 `setThinInstanceColors` | 同上 | https://doc.babylonjs.com/lite/architecture/12-thin-instances/ |
| GPU 视锥剔除实例 / 实例 LOD / 对象池 | `enableThinInstanceGpuCulling(mesh)` / `setThinInstanceLodPartner`；层级模板池 `createHierarchyInstancePool` + `addHierarchyInstance` | 同上 | https://doc.babylonjs.com/lite/architecture/12-thin-instances/ |
| 运行时程序化变形 / 几何更新 / geometry update | `updateMeshGeometry(engine, mesh, positions, normals, indices)` / `updateMeshGeometryCapacity` / `updateMeshPositions` 等单属性更新；读回 `getMeshGeometry(mesh)` | 同上 | https://doc.babylonjs.com/lite/architecture/46-mesh-geometry-update/ |
| 调试线框 / 折线 / 虚线 / lines | `createLineSystem(engine, { lines, colors })` / `createLines` / `createDashedLines` / `updateLineSystem` + `createLineMaterial` | 同上 | https://doc.babylonjs.com/lite/architecture/49-line-system/ |
| 矩阵/向量数学 / mat4 vec3 / 高精度 | `mat4Compose` / `mat4Decompose` / `mat4LookAtLH` / `crossVec3` 等；大坐标 `createEngine(…, { useHighPrecisionMatrix: true })` | 同上 | https://doc.babylonjs.com/lite/architecture/21-core-math/ |

## 09 · 拾取与交互

| 效果（检索词） | 关键 API 范围 | 主题文件 | 原文档 |
| --- | --- | --- | --- |
| 点击/hover 选中网格 / pick / hit test / GPU 拾取 GPU picking | `createGpuPicker(scene)` + `await pickAsync(picker, x, y, { filter })`；释放 `disposePicker(picker)` | [09-picking-interaction.md](topics/09-picking-interaction.md) | https://doc.babylonjs.com/lite/architecture/18-picking/ |
| 精确面/UV/法线拾取 / faceId barycentric | `enableDetailedPicking(picker)` + `getPickedNormal(info, true)` / `getPickedUV(info)` | 同上 | https://doc.babylonjs.com/lite/architecture/18-picking/#exact-gpu-detailed-results |
| 选中体穿透拾取 / 直接操纵身后 / ignore | `pickAsync` 的 `PickOptions.ignore`（可忽略整 mesh 或单 thin instance） | 同上 | https://doc.babylonjs.com/lite/architecture/18-picking/#ignore-one-visible-identity |
| 自定义 GPU 丢弃规则 / discard rule | `PickOptions.discard`（`PickDiscardRule` 的 `wgsl` / `worldAdjustWgsl`） | 同上 | https://doc.babylonjs.com/lite/architecture/18-picking/#pick-vertex-world-adjustment |
| thin instance 单实例拾取 | `pickAsync` → `PickingInfo.thinInstanceIndex`（非 thin 为 -1） | 同上 | https://doc.babylonjs.com/lite/architecture/18-picking/ |
| 高斯泼溅/广告牌拾取 / splatting billboard | contributor 机制（`registerPickSource` / `attachGaussianSplattingMesh` / `pickBillboardSprite`） | 同上 | https://doc.babylonjs.com/lite/architecture/18-picking/#pick-contributors-optional-entity-types |

## 10 · 粒子、文字、精灵与音频

| 效果（检索词） | 关键 API 范围 | 主题文件 | 原文档 |
| --- | --- | --- | --- |
| 粒子系统 / NPE / Node Particle | `parseNodeParticleSource(source)` → `buildNodeParticleSet(engine, scene, graph, options)` → `startParticleSystem`；snippet 直接 `parseNodeParticleSetFromSnippet` | [10-particles-text-audio.md](topics/10-particles-text-audio.md) | https://doc.babylonjs.com/lite/architecture/42-node-particle/ |
| 粒子跟随发射器物体 / emitter | `withNodeParticleEmitterProvider(provider, options)` / `buildNodeParticleSetWithEmitterProvider` | 同上 | https://doc.babylonjs.com/lite/architecture/42-node-particle/ |
| HUD / 2D 精灵界面 / sprite sheet atlas | `loadSpriteAtlas` / `createGridSpriteAtlas` + `createSprite2DLayer(atlas, opts)` + `createSpriteRenderer(engine, opts)` + `registerSpriteRenderer(sr)` | 同上 | https://doc.babylonjs.com/lite/architecture/32-sprites/ |
| 树木/草面向相机 / billboard / 广告牌 | `createFacingBillboardSystem(atlas, opts)` / `createAxisLockedBillboardSystem(atlas, axis, opts)` + `addBillboardSprite` | 同上 | https://doc.babylonjs.com/lite/architecture/32-sprites/ |
| 3D 世界文字 / 2D 文字 / text / 字体 glyph | `loadFont(url)` + `createDefaultTextData(font, sizePx, text)`；3D `createTextRenderable` + `addTextRenderable`；2D `createTextLayer` + `createTextRenderer` + `registerTextRenderer` | 同上 | https://doc.babylonjs.com/lite/architecture/33-text/ |
| 声音播放 / 音效 / sound | `createAudioEngineAsync(options)` + `createSoundAsync(engine, source)` / `playSound` / `setSoundVolume`；流式 `createStreamingSoundAsync` | 同上 | https://doc.babylonjs.com/lite/architecture/41-audio-engine/ |
| 3D 空间音频 / 声音跟随物体 / spatial audio | `enableSpatial(host, options)` + `attachSpatialTarget(sfx, mesh)` + `updateSpatialAudio(audio)` / `setSpatialAutoUpdate(true)` | 同上 | https://doc.babylonjs.com/lite/architecture/41-audio-engine/ |
| 频谱可视化 / 麦克风 / analyzer | `enableAnalyzer(host)` + `getByteFrequencyData` 等 / `createAudioVisualizer(host, canvas)`；麦克风 `createMicrophoneSoundSourceAsync` | 同上 | https://doc.babylonjs.com/lite/architecture/41-audio-engine/ |
| 精灵/文字边缘 A2C 抗锯齿 | `setAlphaToCoverage(layerOrSystem, true)`（Sprite2D 需 `depth: "test-write"`） | 同上 | https://doc.babylonjs.com/lite/architecture/51-alpha-to-coverage/ |

## 11 · 物理与 WebXR

| 效果（检索词） | 关键 API 范围 | 主题文件 | 原文档 |
| --- | --- | --- | --- |
| 刚体掉落 / 堆叠 / physics / Havok | `HavokPhysics({ locateFile })` → `createHavokWorld(scene, hknp)` + `createPhysicsBody`；销毁 `disposePhysics(world)` | [11-physics-xr.md](topics/11-physics-xr.md) | https://doc.babylonjs.com/lite/architecture/42-physics/#world-lifecycle |
| 施力 / 固定步长确定性物理 | `applyPhysicsBodyForce(world, body, ...)` + `setPhysicsTimestepMs(world, fixedDeltaMs)` / `worldStepSeconds(world)` | 同上 | https://doc.babylonjs.com/lite/architecture/42-physics/#timestep--delta-time-propagation |
| 碰撞事件 / 触发器 / trigger / collision events | `setPhysicsBodyCollisionEventsEnabled` + `onPhysicsCollision`；`setPhysicsShapeIsTrigger` + `onPhysicsTrigger` | 同上 | https://doc.babylonjs.com/lite/architecture/42-physics/#feature-modules-opt-in |
| 射线/形状检测 / raycast shape cast | `physicsRaycast` / `shapeCast` / `shapeProximity` | 同上 | https://doc.babylonjs.com/lite/architecture/42-physics/#feature-modules-opt-in |
| 地形碰撞 / heightfield | `createHeightFieldShape` | 同上 | https://doc.babylonjs.com/lite/architecture/42-physics/#feature-modules-opt-in |
| 角色控制器 / 第三人称移动 | `moveWithCollisions` + `getPhysicsCharacterControllerBody` | 同上 | https://doc.babylonjs.com/lite/architecture/42-physics/#feature-modules-opt-in |
| 大世界物理 / floating origin | `enableHavokFloatingOrigin`（配 LWR，见 02 主题）；调试线框 `createPhysicsViewer` | 同上 | https://doc.babylonjs.com/lite/architecture/35-large-world-rendering |
| VR / AR 会话 / WebXR | `isXrSessionSupported(mode)` + `enterXr(scene, options)` / `exitXr(ctx)` | 同上 | https://doc.babylonjs.com/lite/architecture/42-webxr/#public-api-surface |
| VR 手柄 / 输入源 / controller | `createXrInputManager(session, callbacks)`（onSelectStart/End、targetRayMatrix 等） | 同上 | https://doc.babylonjs.com/lite/architecture/42-webxr/#xrxr-inputts |

## 12 · 无头渲染与性能工程

| 效果（检索词） | 关键 API 范围 | 主题文件 | 原文档 |
| --- | --- | --- | --- |
| 无 GPU 服务器端模拟 / headless / null engine | `createNullEngine()`（同步）+ `createSceneContext(engine, { defaultRenderTask: false })` | [12-headless-performance.md](topics/12-headless-performance.md) | https://doc.babylonjs.com/lite/05-headless-null-engine/ |
| 固定步长确定性模拟 / CI 回归测试 | `stepScene(engine, scene, deltaMs)` / `runHeadlessSteps(engine, scene, steps, deltaMs)` | 同上 | https://doc.babylonjs.com/lite/05-headless-null-engine/#fixed-timestep--determinism |
| 纹理/采样器复用 / resource pool | `acquireTexture` / `releaseTexture`；`getOrCreateSampler(device, desc)` / `clearSamplerCache(device)` | 同上 | https://doc.babylonjs.com/lite/architecture/37-resource-pool/ |
| shader 大数据传递 / storage buffer | `createStorageBuffer(engine, data, label)` + `updateStorageBuffer` / `disposeStorageBuffer` / `setShaderStorageBuffer(material, name, buffer)` | 同上 | https://doc.babylonjs.com/lite/architecture/47-storage-buffer/ |
| 最小包体 + 可读错误 / bundle size tree-shaking | `pnpm build:bundle-scenes`（`maxRawKB` 硬门）/ `build:bundle-master-info` | 同上 | https://doc.babylonjs.com/lite/architecture/38-bundle-size-tooling/ |
| 错误码解码 / 遥测 / telemetry | `decodeError(error)`（生产懒 import）；`enableErrorDecoding()` 仅 dev | 同上 | https://doc.babylonjs.com/lite/architecture/49-error-handling/ |
| 掉卡/驱动重置自动恢复 / device lost | `enableDeviceLostSceneRecovery(engine, options)` + `enableDeviceLostSpriteRecovery` / `enableDeviceLostTextRecovery`（环境加载前启用） | 同上 | https://doc.babylonjs.com/lite/architecture/50-device-lost-recovery/ |

## 13 · 迁移与兼容

| 效果（检索词） | 关键 API 范围 | 主题文件 | 原文档 |
| --- | --- | --- | --- |
| BJS→Lite 逐条对照表 / porting quick reference | `new WebGPUEngine`→`await createEngine`、`new Scene`→`createSceneContext`、`setThinInstances` 等（30+ 行） | [13-porting-compat.md](topics/13-porting-compat.md) | https://doc.babylonjs.com/lite/03-porting-guide/#quick-reference |
| 零改码兼容层 / lite-compat | `@babylonjs/lite-compat`（保留类式 API，构建期改写 import；不支持项抛 `LiteCompatError`） | 同上 | https://doc.babylonjs.com/lite/03-porting-guide/ |
| opt-in 陷阱清单 / 12 条关键差异 | `enableStandardVertexColors` / `enableMirroredMeshes(scene)` / `setShadowTaskCasterMeshes` 等 setter/enable 族 | 同上 | https://doc.babylonjs.com/lite/03-porting-guide/#key-differences |
| glTF/KHR 扩展支持矩阵 | `loadGltf`（自动检测 KTX2/Draco/meshopt）+ `selectVariant` / `setDracoBaseUrl` | 同上 | https://doc.babylonjs.com/lite/03-porting-guide/#gltf--pbr-extensions |
| 功能差距总表 / feature comparison | ✅对等 / ⚡子集 / —未支持（GUI、Glow/SSAO/SSR、OBJ 等）/ 🚫不做（WebGL、InstancedMesh） | 同上 | https://doc.babylonjs.com/lite/02-feature-comparison/ |
| 在线运行 / Playground 嵌入 | postMessage 协议（`channel: "babylon-lite-playground"`，命令 `loadCode`/`run`/`dispose`/`getCode`） | 同上 | https://doc.babylonjs.com/lite/04-playground/#embedding |
| 迁移后材质动画 | `markMaterialUboDirty(material)` / `enableMaterialTracking(mat)`（自动追踪 ~1.5KB） | 同上 | https://doc.babylonjs.com/lite/03-porting-guide/#material-animation |
