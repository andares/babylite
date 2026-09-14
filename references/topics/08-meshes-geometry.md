# 08 · 网格、几何与数学

> **效果检索词**：几何体/网格生成 mesh generator · 高度图 heightmap · 层级/父子 parenting / setParent · 变换 transform / 世界矩阵 world matrix · 薄实例化 thin instances / GPU 实例化 instancing / 人群 crowd · 几何更新 geometry update / 顶点写入 · 线段/折线 lines / 虚线 dashed · 矩阵数学 mat4 / 向量 vec3 / 高精度 Float64 / HPM
> **源页快照**（skill 根相对路径，含完整源码级细节）：`references/raw-doc/architecture/10-mesh-generators.md` · `references/raw-doc/architecture/11-scene-hierarchy-parenting.md` · `references/raw-doc/architecture/12-thin-instances.md` · `references/raw-doc/architecture/21-core-math.md` · `references/raw-doc/architecture/36-high-precision-matrix.md` · `references/raw-doc/architecture/46-mesh-geometry-update.md` · `references/raw-doc/architecture/48-mesh-geometry-access.md` · `references/raw-doc/architecture/49-line-system.md`

## API 范围

| API | 用途 | 要点 |
| --- | --- | --- |
| **几何生成器（10 源页，CPU 顶点数据层）** | | |
| `createFlatGroundData(opts)` / `createGroundFromHeightMap(url, opts)` | 地面（含高度图） | 后者 async；高度位移用亮度 `r*0.3+g*0.59+b*0.11` 映射 `[minHeight, maxHeight]` 并重算法线；`applyHeightmap()` 可手动位移 |
| `createTorusData` + `uploadTorusToGPU` / `createSphereData` + `uploadSphereToGPU` / `createBoxData` + `uploadBoxToGPU` | 环面/球/盒 | 返回 CPU 数据 + 独立 upload 助手（`device` 传入）；球 `segments` 默认 32（min 3）、支持 `diameterX/Y/Z` 椭球；盒恒 24 顶点 36 索引，size=1 返回预计算常量 |
| `createCylinderData` / `createPlaneData` / `createDiscData` | 圆柱锥/平面/圆盘 | `diameterTop: 0` → 锥；disc `arc < 1` → 扇形/环；plane 法线 `(0,0,-1)` |
| `createPolyhedronData` / `createRibbonData` / `createTubeData` / `createExtrudeShapeData` | 多面体/条带/管/挤出 | polyhedron `type` 0–14；`flat: true`（默认）每面独立顶点；tube/extrude 用 `CAP_NONE/CAP_START/CAP_END/CAP_ALL` 常量与 `radiusFunction`；全部输出共用 `MeshData { positions, normals, uvs, indices }`（球/盒无 UV）。⚠️ 这些是 MeshBuilder 等价的数据层函数；用户级 `createSphere(engine, …)` 工厂见 01 主题 |
| **层级与变换（11 源页）** | | |
| `createTransformNode(name, …)` | 空变换节点/父子层级 | position/rotationQuaternion/scaling 均为 Observable，改动即推 dirty；`cloneTransformNode()` 克隆子树；世界矩阵版本化惰性传播（静态场景 O(1)） |
| `setParent(child, parent)` | 换父保持世界变换 | 接受 mesh/相机/灯任意实体；四元数分解写回（无欧拉损失）；同步 `children` 数组——直接赋 `child.parent` 只改变换不更新遍历树 |
| `mesh.worldMatrix` / `mesh.worldMatrixVersion` | 读世界矩阵 | `computeWorldMatrix()` 已移除，直接读 getter；相机 worldMatrix = camera-to-world（view 的逆） |
| `IWorldMatrixProvider` / `IParentable` / `createWorldMatrixState` | 内部/低层 | 父/子契约接口与共享世界矩阵缓存工厂 |
| **薄实例（12 源页）** | | |
| `setThinInstances(mesh, matrices, count)` | 批量设置实例矩阵 | 单次 instanced draw 画上千实例；矩阵列主序 16 floats/个；Standard/PBR/ShaderMaterial 全支持 |
| `addThinInstance` / `removeThinInstance` / `setThinInstanceMatrix` / `flushThinInstances` | 单实例增删改 | 容量满时 2× 扩容；删除是 swap-remove（O(1)，末尾实例索引会变）；直接改 Float32Array 后必须 `flushThinInstances` |
| `setThinInstanceCount` / `setThinInstanceDrawCount` / `enableThinInstanceDynamicDrawCount` | 改活动数量 | draw-count 路径不标脏矩阵/颜色（固定容量对象池用）；动态池需在 **registerScene 前** `enableThinInstanceDynamicDrawCount` |
| `setThinInstanceColors(mesh, colors)` | 每实例 RGBA 色 | 独立 `_colorVersion`，矩阵改不动颜色上传；仅 RGBA，无自定义每实例数据 |
| `enableThinInstanceGpuCulling(mesh)` | GPU 视锥剔除 opt-in | **必须 registerScene 前调用**；仅不透明；compute 压缩 + `drawIndexedIndirect` |
| `setThinInstanceLodPartner` / `clearThinInstanceLodPartner` | 距离 LOD 分桶 | `{ distance, band }`；两 mesh 均需已有薄实例态；在 `setThinInstances` 后、`registerScene` 前配置 |
| `createHierarchyInstancePool` / `addHierarchyInstance` / `setHierarchyInstanceMatrix` / `removeHierarchyInstance` / `setHierarchyInstanceCount` | 层级实例池（旧 instantiateHierarchy 替代） | registerScene 前建池；matrix 与模板层级**复合**（像加在根上的父节点）；清空用 `setHierarchyInstanceCount(pool, 0)`，勿用 setSubtreeVisible 隐藏 |
| `ThinInstanceData` / `THIN_INSTANCES` / `THIN_INSTANCE_COLOR` | 内部/低层 | 实例态结构与 shader feature flag；不用薄实例的场景零 bundle 开销（动态 import） |
| **数学（21 源页）** | | |
| `vec3` / `addVec3` / `subVec3` / `scaleVec3` / `dotVec3` / `crossVec3` / `normalizeVec3` / `lerpVec3` / `writeVec3` | Vec3 纯函数 | 全部返回新对象不变异；零向量归一化返回 (0,0,0)；`writeVec3` 写 uniform buffer |
| `mat4Identity` / `mat4Multiply` / `mat4Scale` / `mat4Translation` / `mat4FromQuat(+Into)` | Mat4 构造/组合 | 列主序，匹配 WGSL `mat4x4<f32>`；左手系 |
| `mat4Compose(tx…qw…sz)` / `mat4Decompose(m)` | TRS 合成/分解 | 分解保留镜像（折叠为负 Y scale，匹配 BJS）；假设无剪切 |
| `mat4LookAtLH` / `mat4LookAtWorldLHToRef` / `mat4PerspectiveLH` / `mat4Invert` | 视图/投影/逆 | LH、深度 [0,1]；逆奇异返回 `null`；`quatFromRotationMatrix` / `quatFromLookDirectionRH` 四元数提取 |
| **高精度矩阵（36 源页）** | | |
| `createEngine(…, { useHighPrecisionMatrix: true })` | F64 矩阵底座 | 大坐标（~1e5+）保亚单位精度；F64→F32 只在 GPU 上传边界降一次；**同页混用 HPM/非 HPM 引擎不受支持**（静默错精） |
| `allocateMat4` / `packMat4IntoF32` | 内部/低层 | 进程级分配器单例与唯一 GPU 打包边界（带 floating-origin 偏移参数） |
| **几何读写（46/48 源页）** | | |
| `updateMeshGeometry(engine, mesh, positions, normals, indices, uvs?, …)` | 原地整包更新 | 顶点/索引数量与可选属性 presence 必须不变；GPU buffer 身份稳定，缓存 render bundle 保持有效；mesh 须来自 `createMeshFromData` 紧凑布局（交错/克隆共享几何被拒） |
| `updateMeshGeometryCapacity(…, reserveFactor?)` | 容量预留式拓扑增减 | grow-only，`reserveFactor` 默认 1.25；保留尾部退化三角形保持 buffer 稳定；返回 `{ stable, vertexCapacity, indexCapacity }`；一次性改布局用 `resizeMeshGeometry` |
| `updateMeshPositions` / `updateMeshNormals` / `updateMeshColors` / `updateMeshUvs` / `updateMeshUv2` / `updateMeshTangents` | 单属性范围更新 | 可选 `vertexOffset/vertexCount/sourceVertexOffset`；非法范围在任何 GPU 写之前抛出 |
| `getMeshGeometry(mesh)` | 读 CPU 侧几何 | 返回**独立拷贝**（typed-array slice）；positions/normals/indices 缺任一返回 `null`；可选属性仅当 mesh 已保留时返回 |
| **线段系统（49 源页）** | | |
| `createLineSystem(engine, { lines, colors? })` / `createLines(engine, { points, … })` | 多段折线/单折线 Mesh | WebGPU `line-list` 拓扑；每点可带 RGBA 色；返回普通 Mesh（非 LinesMesh），需 `addToScene` |
| `updateLineSystem(engine, mesh, { lines, colors? })` | 原地更新折线 | 点数/线数不可变（`linePointCounts` 校验），改连接数需重建；省略 colors 保留已有色 |
| `createDashedLines` / `updateDashedLines` | 虚线 | `dashSize` 3 / `gapSize` 1 / `dashNb` 200；更新按保留的 dash 数重排，GPU buffer 稳定 |
| `createLineMaterial(opts?)` / `setLineMaterialColor(mat, color)` | 线材质（ShaderMaterial） | `useVertexAlpha` 默认 true；`useThinInstances`/`useThinInstanceColors` 是编译期选择，须 registerScene 前定 |

## 最小示例

薄实例网格（官方签名拼装，参照 12 源页 "State Machine / Lifecycle" 与 01 主题起步结构）：

```ts
import {
    createEngine, createSceneContext, createSphere, addToScene, registerScene, startEngine,
    setThinInstances, setThinInstanceColors, mat4Compose,
} from "@babylonjs/lite";

const engine = await createEngine(canvas);
const scene = createSceneContext(engine);

const sphere = createSphere(engine, { diameter: 1, segments: 12 });
addToScene(scene, sphere);

// 100 个实例：每实例一个列主序 4x4 矩阵（16 floats）
const N = 100;
const matrices = new Float32Array(N * 16);
for (let i = 0; i < N; i++) {
    const m = mat4Compose(                                       // TRS 合成 → Mat4
        (i % 10) * 2, 0, Math.floor(i / 10) * 2,                 // translation
        0, 0, 0, 1,                                              // rotation (quat)
        0.5, 0.5, 0.5,                                           // scale
    );
    matrices.set(m as unknown as Float32Array, i * 16);
}
setThinInstances(sphere, matrices, N);                           // 单次 instanced draw
setThinInstanceColors(sphere, new Float32Array(N * 4).fill(1));  // 可选：每实例 RGBA

await registerScene(scene);
await startEngine(engine);
```

（几何生成器/线系统为数据层 API：`createTubeData({ path, radius, cap: CAP_ALL })` 产出 `MeshData` 再经
`createMeshFromData` 建 mesh；换父保持世界变换用 `setParent(child, node)`。签名全文见对应源页。）

## 相关效果

| 效果 | 关键 API | 原文档 |
| --- | --- | --- |
| 高度图地形 | `createGroundFromHeightMap` / `applyHeightmap` | https://doc.babylonjs.com/lite/architecture/10-mesh-generators/ |
| 管/挤出/条带造型 | `createTubeData` / `createExtrudeShapeData` / `createRibbonData` | https://doc.babylonjs.com/lite/architecture/10-mesh-generators/ |
| 父子层级/挂载换父 | `createTransformNode` / `setParent` | https://doc.babylonjs.com/lite/architecture/11-scene-hierarchy-parenting/ |
| 大规模实例/人群 | `setThinInstances` + `enableThinInstanceGpuCulling` | https://doc.babylonjs.com/lite/architecture/12-thin-instances/ |
| 层级模板实例池 | `createHierarchyInstancePool` / `addHierarchyInstance` | https://doc.babylonjs.com/lite/architecture/12-thin-instances/ |
| 大坐标抖动/精度 | `useHighPrecisionMatrix: true`（配 LWR 见 35 源页） | https://doc.babylonjs.com/lite/architecture/36-high-precision-matrix/ |
| 运行时程序化变形 | `updateMeshGeometry` / `updateMeshGeometryCapacity` / `updateMeshPositions` | https://doc.babylonjs.com/lite/architecture/46-mesh-geometry-update/ |
| 读取/导出顶点数据 | `getMeshGeometry` | https://doc.babylonjs.com/lite/architecture/48-mesh-geometry-access/ |
| 调试线框/折线/虚线 | `createLineSystem` / `createLines` / `createDashedLines` | https://doc.babylonjs.com/lite/architecture/49-line-system/ |
| 矩阵/向量手算 | `mat4Compose` / `mat4Decompose` / `crossVec3` 等 | https://doc.babylonjs.com/lite/architecture/21-core-math/ |
