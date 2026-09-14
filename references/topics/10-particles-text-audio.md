# 10 · 粒子、文字、精灵与音频

> **效果检索词**：粒子系统/particle/NPE/Node Particle · 精灵/sprite · 广告牌/billboard · 图集/atlas · 精灵图集/sprite sheet · HUD/2D 叠加层 · 文字渲染/text/字体/glyph · 音频/audio/声音/sound · 3D 空间音频/spatial audio · 频谱可视化/analyzer/visualizer · 麦克风/microphone · 解锁/unmute
> **源页快照**（skill 根相对路径，含完整源码级细节）：`references/raw-doc/architecture/42-node-particle.md` · `references/raw-doc/architecture/32-sprites.md` · `references/raw-doc/architecture/33-text.md` · `references/raw-doc/architecture/41-audio-engine.md`

## API 范围

| API | 用途 | 要点 |
| --- | --- | --- |
| **粒子（NPE，CPU 图）** | | 只执行 Node Particle Editor 序列化图；**无 GPU 粒子路径** |
| `parseNodeParticleSource(source)` | 解析 NPE 序列化数据 → `ParticleGraph` | 输入需含 `blocks` 数组且有 SystemBlock，否则显式抛错 |
| `normalizeNodeParticleGraph(graph)` | 图规整（Teleport/LocalVariable/Elbow/Debug） | 图含 Phase 3 块（如 `ParticleTeleportOutBlock`）时**必须先规整**再 build；snippet 路径自动调用 |
| `buildNodeParticleSet(engine, scene, graph, options?)` | 构建粒子集 → `NodeParticleSet` | 变体：`…WithBlendModes`（精确 billboard Multiply/MultiplyAdd）/`…WithFlowMaps`（UpdateFlowMapBlock）/`…WithNoiseTextures`（UpdateNoiseBlock）/`…WithTextureUpdates`（两者兼有）/`…WithEmitterProvider`；options：`emitter` / `emitterWorldMatrix`（矩阵优先）/ `textureBaseUrl` |
| `parseNodeParticleSetFromSnippet(engine, scene, snippetId, options?)` | 从 snippet 服务器/内联 JSON 构建 | 默认 `https://snippet.babylonjs.com`；`options.json` 内联时忽略 snippetId；自动 normalize |
| `withNodeParticleEmitterProvider(provider, options?)` | 活动发射器矩阵（跟随物体） | provider 返回 16 元素矩阵；优先于静态 `emitterWorldMatrix`；⚠️ 旧 post-build `enableNodeParticleEmitterProvider` **已移除**，无兼容垫片 |
| `enableNodeParticleBlendModes(set)` | 已建集合开精确混合模式 | 模式 3/4 挂私有 Multiply 着色器；读取注册时的当前 `blendMode` |
| `startParticleSystem` / `stopParticleSystem` / `animateParticleSystem(system, scaledRatio)` | 模拟驱动 | stop 只置 `_stopped`：继续更新/消亡存量粒子但停止新生；start 不清空存活粒子 |
| `registerNodeParticleSet(scene, set, options?)` | 注册到场景（billboard 目标） | `options.autoStart` |
| `createParticleBillboard` + `syncParticleBillboard` | 相机朝向世界空间 billboard | 也可 `addFacingBillboardSystem` 挂场景 |
| `createParticleSprite2DBridge` + `syncParticleSprite2DBridge` / `registerNodeParticleSet2D` | 纯 2D Sprite2D 桥（仅世界 XY，不投影 XZ/YZ） | `pixelsPerUnit` / `originPx` / `invertY` / `layer`；WithBlendModes 变体为精确混合 2D 路径 |
| `ParticleSystem`（接口）/ `createParticleBuffer` / `spawnParticle` / `killParticle` / `column` | 内部/低层：SoA 存储 | 21 个内置列（pos/dir/age/lifeTime/id/size/angle/scale/color/colorStep）；粒子的槽位是整数索引非对象；`_emitRate` 等默认值见 42 源页 §5 |
| **精灵（两大家族）** | | |
| `loadSpriteAtlas(engine, textureUrl, options?)` / `createGridSpriteAtlas(texture, options)` | 精灵图集 | `LoadAtlasOptions.gridSize` 网格切分；`metadataUrl`（TexturePacker JSON）**保留但今天会 throw**；图集可跨层/场景共享 |
| `createSprite2DLayer(atlas, opts?)` | 像素坐标 2D 层（基础家族） | `depth: "none"（默认，走 SpriteRenderer）\| "test" \| "test-write"（走 addDepthHostedSpriteLayer 进 3D 深度）`；`blendMode`（`spriteBlend*` 描述符值）；`uvScroll: true` 每精灵加 uvOffset；`customShader` 过程化片元（`fx.time` + `setSprite2DShaderParams`） |
| `addSprite2DIndex(layer, props)` / `updateSprite2DIndex` / `removeSprite2DIndex` / `setSprite2DFrameIndex` / `setSprite2DUvOffset` | Index API（低层，类似 ThinInstance） | props：`positionPx` / `sizePx` / `frame`（数字索引）/ `z`（仅 depth 层）/ `uvOffset`（仅 uvScroll 层） |
| `addSprite2D` / `updateSprite2D` / `removeSprite2D` 等 | Handle API（稳定 id，独立可摇树模块） | `Sprite2DHandle`；Index-only 场景不引入 handle 代码 |
| `enableSprite2DYSort(layer, options?)` | 层内 Y 排序（俯视/等距 2.5D） | 仅 `depth: "none"`；对 depth 层启用会 throw |
| `createSpriteRenderer(engine, opts)` + `registerSpriteRenderer(sr)` / `addSpriteRendererLayer` / `disposeSpriteRenderer` | 纯 2D/HUD 渲染器 | HUD 用 `clear: false` 且**注册在 registerScene 之后**（画在最上）；生命周期挂 `onSceneDispose(scene, () => disposeSpriteRenderer(hud))`；HUD 层**绝不走 addToScene** |
| `addDepthHostedSpriteLayer(scene, layer)` | 深度参与型 2D 层入 3D 场景 | depth:"none" 会 throw |
| `createRenderTexture2D(engine, w, h, options?)` + `setSpriteRendererTarget(sr, target)` | 精灵离屏渲染（CRT/后处理积木） | target 格式**必须用默认 engine.format**，否则 WebGPU 校验报错；RT 固定尺寸，resize 需重建 |
| `createFacingBillboardSystem(atlas, opts?)` / `createAxisLockedBillboardSystem(atlas, axis, opts?)` | 世界坐标 billboard 家族 | Facing=始终面向相机；AxisLocked 沿轴锁定（yaw-locked = `[0,1,0]`）；世界单位尺寸、透视缩短、深度参与，**无纯 2D 路径** |
| `addBillboardSprite(system, init)`（Handle）/ `addBillboardSpriteIndex`（Index） | 添加 billboard 精灵 | |
| `addFacingBillboardSystem(scene, system)` / `addAxisLockedBillboardSystem(scene, system)` | billboard 入场景 | |
| `createBillboardCustomShader(options)` | billboard 自定义着色器 | |
| `setAlphaToCoverage(layerOrSystem, true)` | A2C 抗锯齿边缘 | Sprite2D 需 `depth: "test-write"` + 多重采样；billboard 需 cutout 变体；纯 2D/HUD 路径无效 |
| `sprite2DWorldToScreenToRef` / `sprite2DScreenToWorldToRef` / `getSprite2DVisibleBoundsToRef` / `centerSprite2DView` | 2D 视图（pan/zoom/rotation）坐标换算 | zoom=0 时逆变换抛错 |
| **文字（Slug GPU 字形渲染，四层）** | | 分辨率无关的贝塞尔字形；3D 与纯 2D 共用一套管线 |
| `createGlyphStorage` / `updateGlyphStorage` / `disposeGlyphStorage` | Tier 1 字形轮廓+图集 | 按 glyph id 幂等（已存在跳过）；一个 storage 可背多个 TextData；寿命调用方所有 |
| `createTextData(storage, runs?)` / `updateTextData(data, update)` / `disposeTextData` | Tier 2 文本块（GlyphRun 槽位分配） | update 为判别联合 `reset / addRun / removeRun / replaceRun`；replaceRun 同字数同字体走就地重写快路径（打字场景逐键更新便宜） |
| `createTextRenderable(data, options?)` + `addTextRenderable(scene, r)` | Tier 3a：3D 世界空间文字 | 镜像 Mesh 的 TRS；默认透明排序 `order: 200`；`ignoreDepth` 跳过深度；可 `setAlphaToCoverage` |
| `createTextLayer(data, options?)` / `createTextRenderer(engine, opts)` + `registerTextRenderer` | Tier 3b：独立 2D 文字（无场景无相机） | HUD 文字：registerScene 后再 registerTextRenderer；层属性可帧间直接改 |
| `loadFont(url)` / `createFontFromBuffer` / `createDefaultTextData(font, fontSizePx, text, color?, options?)` / `updateDefaultTextData` | Tier 4 默认助手（依赖 text-shaper） | 一次调用完成 shaping+轮廓提取+图集打包；`DefaultTextData` 带 `width/height`；自排版调用方只引 Tier 1–3 可零字节避开 |
| **音频（Web Audio 行为移植）** | | 与渲染栈完全解耦：无 GPU/场景/渲染循环依赖；100% opt-in |
| `createAudioEngineAsync(options?)` / `disposeAudioEngine` / `unlockAudioEngineAsync` / `setMasterVolume` | 引擎 | `audioContext` 可传 `OfflineAudioContext` 做确定性离线渲染；`resumeOnInteraction` 默认 true（首次点击恢复） |
| `createSoundAsync(engine, source, options?)` / `playSound` / `pauseSound` / `resumeSound` / `stopSound` / `disposeSound` / `setSoundVolume` | 静态声音 | source 为 URL/ArrayBuffer/AudioBuffer/SoundBuffer；每次 play 生成 instance，`maxInstances` 裁剪最旧 |
| `createStreamingSoundAsync(engine, source, options?)` + `play/pause/resume/stop/disposeStreamingSound` / `preloadStreamingInstance(s)Async` | 流式声音（HTMLAudioElement） | `preloadCount` 默认 1；专用函数族，不与静态共享 |
| `createAudioBusAsync(engine, name, options?)` / `disposeAudioBus` / `setBusVolume` | 总线混音路由 | `outBus` 级联到 MainBus（引擎所有，**无公开 createMainBusAsync**） |
| `enableSpatial(host, options?)` / `setSpatialPosition` / `setSpatialOrientation` / `attachSpatialTarget` / `detachSpatialTarget` / `setSpatialListener` / `updateSpatialAudio` / `setSpatialAutoUpdate` | 3D 空间音频 | **显式 enable* 函数开启**（非 options 字段）；`attachedTo` 可跟随 Lite Mesh 的 worldMatrix（单向数据所有权）；`distanceModel` 默认 **"linear"**；手动模式在渲染循环调 `updateSpatialAudio`，或 `setSpatialAutoUpdate(true)` 自动 RAF |
| `enableStereo(host, options?)` / `setStereoPan(host, pan, options?)` | 立体声声像 | host 为 `AudioGraphHost`（声音/总线/输入源） |
| `enableAnalyzer(host, options?)` / `getByteFrequencyData` / `getFloatFrequencyData` / `getByteTimeDomainData` / `getFloatTimeDomainData` | FFT 频谱/波形分析 | 可视化基础 |
| `createAudioVisualizer(host, canvas, options?)` + `start/stop/render/disposeAudioVisualizer` | 波形/频条可视化（Lite 独有） | 展示层胶水，非 AudioV2 移植 |
| `createSoundSourceAsync` / `createMicrophoneSoundSourceAsync` / `setSoundSourceVolume` / `disposeSoundSource` | 输入源/麦克风（getUserMedia） | 返回 `AudioInputSource` |
| `createUnmuteUI(engine, { parentElement })` + `setUnmuteUIEnabled` / `disposeUnmuteUI` | 浏览器手势解锁按钮 | 注意大写 `UI` |
| `createAudioEngineMediaStream(engine)` / `disposeAudioEngineMediaStream` | 主输出镜像为 MediaStream（录制/WebRTC） | 需实时 AudioContext；不影响扬声器输出 |
| `RampOptions { shape, duration }` | 参数渐变 | `none / linear / exponential / logarithmic`；各 set*Volume / setStereoPan 可选 |

## 最小示例

文字（2D 独立路径，官方示例裁剪自 33 源页）；粒子和音频为最小可读伪例：

```ts
// ── 文字：字体 URL → 画布上的文字（33 源页官方示例） ──
import { createEngine, startEngine, loadFont, createDefaultTextData, createTextLayer, createTextRenderer, registerTextRenderer } from "@babylonjs/lite";

const engine = await createEngine(canvas);
const font = await loadFont("/fonts/Inter.ttf");
const data = createDefaultTextData(font, 48, "Hello, world!");
const layer = createTextLayer(data, { positionPx: { x: 32, y: 64 } });
const renderer = createTextRenderer(engine, { layers: [layer] });
registerTextRenderer(renderer);          // 独立 2D：无 scene、无 camera
await startEngine(engine);

// ── 粒子：snippet 构建 + billboard 注册（参照 42 源页 §2/§3 数据流） ──
const set = await parseNodeParticleSetFromSnippet(engine, scene, "#ABC/def");
registerNodeParticleSet(scene, set, { autoStart: true });           // billboard 目标；含 Teleport 的图自动 normalize

// ── 音频：引擎 + 声音 + 空间化（参照 41 源页 As-Built 一节） ──
const audio = await createAudioEngineAsync();
const sfx = await createSoundAsync(audio, "hit.mp3");
enableSpatial(sfx, { position: [0, 1, 0], distanceModel: "linear" }); // 显式 enable*，非 options 字段
attachSpatialTarget(sfx, mesh);                                       // 跟随 Mesh 世界矩阵
updateSpatialAudio(audio);                                            // 手动模式：渲染循环里泵更新
playSound(sfx);
```

## 相关效果

| 效果 | 关键 API | 原文档 |
| --- | --- | --- |
| NPE 编辑器粒子（CPU） | `parseNodeParticleSource` → `buildNodeParticleSet` → `startParticleSystem` | https://doc.babylonjs.com/lite/architecture/42-node-particle/ |
| 粒子跟随发射器物体 | `withNodeParticleEmitterProvider` / `buildNodeParticleSetWithEmitterProvider` | 同上 |
| HUD / 纯 2D 精灵界面 | `createSprite2DLayer` + `createSpriteRenderer` + `registerSpriteRenderer` | https://doc.babylonjs.com/lite/architecture/32-sprites/ |
| 树木/草 billboard（面向相机） | `createFacingBillboardSystem` / `createAxisLockedBillboardSystem` | 同上 |
| CRT / 全屏后处理 | `createRenderTexture2D` + `setSpriteRendererTarget` | 同上 |
| 3D 世界空间文字 / 2D 文字 | `createTextRenderable` + `addTextRenderable` / `createTextRenderer` | https://doc.babylonjs.com/lite/architecture/33-text/ |
| 3D 空间音频（声音跟随物体） | `enableSpatial` + `attachSpatialTarget` + `updateSpatialAudio` | https://doc.babylonjs.com/lite/architecture/41-audio-engine/ |
| 音频频谱可视化 | `enableAnalyzer` + `getByteFrequencyData` / `createAudioVisualizer` | 同上 |
| 精灵/文字边缘 A2C 抗锯齿 | `setAlphaToCoverage`（见 05 主题 alpha-to-coverage） | https://doc.babylonjs.com/lite/architecture/51-alpha-to-coverage/ |
