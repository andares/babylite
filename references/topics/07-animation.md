# 07 · 动画（Animation / Skeleton / Morph / VAT）

> **效果检索词**：动画组 animation group · 关键帧 keyframe · 权重混合 blend / weight · 融合 cross-fade / fade · 叠加层 additive · 掩码 mask · 骨骼 skeleton / skinning / 蒙皮 · 骨头控制 bone control · 变形目标 morph targets / blend shapes / 表情 facial · VAT / 顶点动画纹理 / 烘焙动画 / 人群 crowd · 确定性动画测试
> **源页快照**（skill 根相对路径，含完整源码级细节）：`references/raw-doc/architecture/07-animation.md` · `references/raw-doc/architecture/13-skeleton.md` · `references/raw-doc/architecture/14-morph-targets.md` · `references/raw-doc/architecture/15-vertex-animation-texture.md` · `references/raw-doc/architecture/39-animation-parity-testing.md`

## API 范围

| API | 用途 | 要点 |
| --- | --- | --- |
| `createAnimationManager(options?)` | 动画管理器 | 独立于场景；`{ engine?, fixedDeltaMs?, onUpdate? }`；engine 可选，提供后才能上传骨骼/变形 GPU 数据 |
| `startAnimationManager(m)` / `stopAnimationManager(m)` | 自治 rAF 循环 | 也可用 `updateAnimationManager(m, deltaMs)` 由调用方驱动（如 `onBeforeRender`），或 `goToFrame(group, f)` 确定性定位 |
| `createPropertyAnimationClip(name, tracks, opts?)` | 手写属性动画 clip | track: `{ path: "position.x" 或 "position"/"rotationQuaternion"/"scaling", keys: [{frame, value}], frameRate?, interpolation?, quaternion? }`；等价 BJS `new Animation + setKeys`；clip 可复用 |
| `createPropertyAnimationGroup(m, target, clip, opts?)` | 绑定目标生成 AnimationGroup | 等价 `scene.beginDirectAnimation`；opts: `{ loop?, speedRatio?, fromFrame?, toFrame?, fromTime?, toTime? }`；**非法 path 在此立即抛错** |
| `playAnimation(g)` / `pauseAnimation(g)` / `stopAnimation(g)` | 组播放控制 | 替代 BJS `AnimationGroup.play/pause/stop`；所有组默认自动播放 |
| `goToFrame(group, frame, engine?)` | 定位到帧 | 用 `group.frameRate` 换算秒，立即求值姿势后暂停；确定性测试/VAT 烘焙都用它 |
| `setAnimationWeight(group, weight)` | 设置组权重 | 默认 1；加权混合需先 enable（见下两行），权重不做归一化（BJS 式加权和） |
| `enableAnimationBlending(m)` | glTF 骨骼加权混合 opt-in | 不调用则不加载骨骼 mixer；同资产的组混合成一个 TRS 姿势、每骨架仅一次 bone texture 上传；目前覆盖骨骼 TRS，morph 混合为后续计划 |
| `enablePropertyAnimationBlending(m)` | 手写属性动画加权混合 opt-in | 仅对同目标同属性路径的多个 manual 组生效，避免 last-write-wins |
| `crossFadeAnimationGroups(m, from, to, { durationMs })` | 交叉渐变 | 基于 fade job 确定性调度；单组权重渐变用 `fadeAnimationWeight(m, g, { to, durationMs })` |
| `setAnimationAdditive(g, { referenceFrame })` | 叠加层 | 在 override 组之上加 delta；位移/缩放加 `sample - reference`，旋转用 `reference⁻¹ * sample` 后按权重 slerp |
| `createAnimationGroupMask(names?, mode?)` | 掩码（局部动画） | 赋给 `group.mask`；按节点/骨骼名精确匹配；`AnimationGroupMaskMode.Include/Exclude`；首次调用才激活 masking 路径（零 bundle 开销）；查询用 `animationGroupMaskRetainsTarget(mask, name)` |
| `createAnimationGroups(animData)` | glTF 数据 → AnimationGroup[] | 通常不直接调：`loadGltf` 结果的 `container.animationGroups` 已就绪，`addAnimationGroups(m, groups)` 注册即可 |
| `evaluateSampler(sampler, t, stride, isQuat, dst, off)` | 内部/低层 | 关键帧求值核心（LINEAR/STEP/CUBICSPLINE）；quaternion 用 slerp；零分配热路径 |
| `INTERP_LINEAR/STEP/CUBICSPLINE` · `PATH_TRANSLATION/ROTATION/SCALE/WEIGHTS` | 内部/低层 | 插值模式与目标通道的数字常量 |
| `enableBoneControl()` | 骨骼级控制 opt-in | **加载前调用一次**；未调用时整个模块 tree-shake 掉 |
| `getBoneByName(skeleton, name)` → `setBonePosition` / `setBoneRotationQuaternion` / `setBoneScaling` / `clearBoneOverride` | 覆盖单根骨骼变换 | set 后立即重烘焙并上传；播放中被 clip 动到的分量会覆盖 override，clip 未动的分量保留 |
| `setBoneVisible(skel, bone, false)` | 隐藏骨骼子树 | scale→0，在所有姿势路径中最后应用，**优先于动画**；一个 skin 跨多 mesh 时单次 set 更新全部 bone texture |
| `updateSkeletonBoneMatrices(engine, skeleton, boneMatrices)` | 手动上传骨骼矩阵 | 校验数量、同步 CPU 镜像并上传；`createSkeleton(...)` 为低层工厂（bone texture + joints/weights buffers，支持 8 骨） |
| `bakeVat(engine, mesh, groups, opts?)` | 烘焙 VAT | mesh 须仍有 live `mesh.skeleton`；逐帧求值骨骼矩阵到一张 `rgba32float` 纹理（宽 `boneCount*4`，每行一帧） |
| `prepareVat(mesh, groups)` + `createVatBakeResult(engine, prepared)` | 离线烘焙两段式 | CPU 求值得可持久化 `Float32Array`，运行时再上传；批量版 `prepareVatMany` / `createVatBakeResults` / `bakeVatMany` |
| `attachVat(engine, mesh, baked, clip?)` | 启用 VAT | 置 `mesh.vat` 并**清空 `mesh.skeleton`**（不再有 CPU 骨骼/逐帧上传）；自注册 VAT pbrExt |
| `VatHandle.play / update / setInstances / setInstancesBlend` | VAT 运行时 | `play(clip, {offset?, fps?})` 选 clip；`update(dt)` 推进共享时钟；实例化：`setInstances`（4 float/实例单 clip）、`setInstancesBlend`（8 float/实例双 clip 混合，blend∈[0,1]） |
| `setVatTime(engine, mesh, seconds)` / `setVatInstanceStorage(...)` | VAT 辅助 | 直接改时间 / 换实例参数存储 buffer |
| `engine._fixedDeltaMs = 16.0` / `engine.pauseAnimations()` | 内部/低层（确定性测试） | 奇偶校验测试用：固定 16ms 步长 + 冻结帧 + `canvas.dataset.animationFrozen` 信号（见 39 源页） |

⚠️ **max 4 morph targets**（`MorphBinding.targetCount`，vec4 权重 UBO 限制）；morph 仅支持 PBR 管线、仅 POSITION/NORMAL delta。morph 权重由动画通道（PATH_WEIGHTS）每帧驱动，无独立手写 API。

## 最小示例

加权混合两个 glTF 动画组 + 掩码（官方示例裁剪）：

```ts
import { loadGltf, addToScene, createAnimationManager, addAnimationGroups,
         setAnimationWeight, enableAnimationBlending, updateAnimationManager,
         onBeforeRender, createAnimationGroupMask, AnimationGroupMaskMode } from "@babylonjs/lite";

const xbot = await loadGltf(engine, "Xbot.glb");
for (const entity of xbot.entities) addToScene(scene, entity);

const manager = createAnimationManager({ engine });
addAnimationGroups(manager, xbot.animationGroups ?? []);

for (const group of xbot.animationGroups ?? []) setAnimationWeight(group, 0);
setAnimationWeight(xbot.animationGroups!.find((g) => g.name === "walk")!, 0.5);
setAnimationWeight(xbot.animationGroups!.find((g) => g.name === "run")!, 0.5);
enableAnimationBlending(manager);

// 掩掉双腿：上身走路、腿保持绑定姿势
const walk = xbot.animationGroups!.find((g) => g.name === "walk")!;
walk.mask = createAnimationGroupMask(
    ["mixamorig:LeftUpLeg", "mixamorig:LeftLeg", "mixamorig:LeftFoot",
     "mixamorig:RightUpLeg", "mixamorig:RightLeg", "mixamorig:RightFoot"],
    AnimationGroupMaskMode.Exclude,
);

onBeforeRender(scene, (deltaMs) => updateAnimationManager(manager, deltaMs));
```

手写属性动画 + 交叉渐变（参照 07 源页 Usage Examples）：

```ts
const clip = createPropertyAnimationClip("xSlide", [
    { path: "position.x", frameRate: 10, keys: [{ frame: 0, value: 2 }, { frame: 10, value: -2 }, { frame: 20, value: 2 }] },
]);
const group = createPropertyAnimationGroup(manager, box, clip, { fromFrame: 0, toFrame: 20, loop: true });
startAnimationManager(manager);
// 渐变：crossFadeAnimationGroups(manager, walk, run, { durationMs: 300 });
```

VAT 烘焙 + 实例化人群（参照 15 源页 State Machine/Lifecycle）：

```ts
const baked = bakeVat(engine, mesh, shark.animationGroups ?? []);
const handle = attachVat(engine, mesh, baked, "swim");   // mesh.skeleton 被清空
// setThinInstances(mesh, matrices, count) 后、registerScene 前：
handle.setInstancesBlend(params);                        // 8 float/实例：A(行区间,offset,fps) + B(…,blend)
handle.update(dt);                                       // 每帧推进共享时钟；单 draw call + CSM 阴影
```

## 相关效果

| 效果 | 关键 API | 原文档 |
| --- | --- | --- |
| walk/run 权重混合（角色双动画融合） | `setAnimationWeight` + `enableAnimationBlending` | https://doc.babylonjs.com/lite/architecture/07-animation/#gltf-skeleton-weight-mixing |
| 平滑切换两个动画（cross-fade） | `crossFadeAnimationGroups` / `fadeAnimationWeight` | https://doc.babylonjs.com/lite/architecture/07-animation/ |
| 叠加层（摇头/姿势层叠加走路） | `setAnimationAdditive(g, { referenceFrame })` | https://doc.babylonjs.com/lite/architecture/07-animation/ |
| 半身动画 / 掩掉部分骨骼 | `createAnimationGroupMask` + `AnimationGroupMaskMode` | https://doc.babylonjs.com/lite/architecture/07-animation/#animationgroupmask |
| 手写关键帧动画（位置/旋转/缩放） | `createPropertyAnimationClip` + `createPropertyAnimationGroup` | https://doc.babylonjs.com/lite/architecture/07-animation/#usage-examples |
| 单骨骼控制 / 隐藏骨骼子树 | `enableBoneControl` + `getBoneByName` / `setBoneVisible` | https://doc.babylonjs.com/lite/architecture/13-skeleton/#bone-control-opt-in |
| 表情/口型（morph 权重动画） | glTF PATH_WEIGHTS 通道自动驱动（max 4 targets） | https://doc.babylonjs.com/lite/architecture/14-morph-targets/ |
| 人群/GPU 实例化动画（VAT 烘焙） | `bakeVat` + `attachVat` + `setInstancesBlend` | https://doc.babylonjs.com/lite/architecture/15-vertex-animation-texture/ |
| 离线烘焙动画数据 | `prepareVat` + `createVatBakeResult` | https://doc.babylonjs.com/lite/architecture/15-vertex-animation-texture/#preparation-and-upload |
| 动画奇偶校验/黄金截图测试 | `engine._fixedDeltaMs` + `engine.pauseAnimations()` + freeze 协议 | https://doc.babylonjs.com/lite/architecture/39-animation-parity-testing/ |
