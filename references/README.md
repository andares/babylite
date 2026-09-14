# Babylon Lite 效果速查 · 使用说明

## 这是什么

**`@babylonjs/lite`**（Babylon.js Lite）是 Babylon.js 的 WebGPU 原生渲染器，采用**工厂函数 + 纯数据对象**而非类式 API。
本目录是**以"实现效果"为索引**的 API 速查：通过 1–2 次跳转定位某效果要用到的 API 范围（函数名 + 关键参数 + 陷阱），
并给出对应的原文档 URL 与本地原文快照。

- 面向读者：在本仓库之外的项目里写 Babylon Lite 代码的 AI agent 与开发者。
- 不替代 API 参考：速查**不给完整签名表**，精确签名读 `node_modules/@babylonjs/lite` 的 `.d.ts`（见下）。

## 铁律（先读这个）

1. **只用 `@babylonjs/lite` 的原生 API**（`createEngine` / `createSceneContext` / `addToScene` / `registerScene` / `startEngine` 这类工厂函数）。
   **禁止给出 `@babylonjs/core` 的类式写法**（`new Scene(engine)`、`new PBRMaterial()`、`scene.render()` 等）。
2. 官方存在过渡包 `@babylonjs/lite-compat`（Babylon.js 形状的兼容层，可把 `@babylonjs/*` import 在构建期改写），
   但**它不是原生路径**；新代码一律走原生 API。
3. **不确定函数签名 / 参数 / 返回类型时，直接读本地源码**：
   `node_modules/@babylonjs/lite/` 下的 `.d.ts` 类型声明与实现。
   本地源码与当前安装版本严格一致，比任何网络 API 文档都准确。
4. 速查不给"完整 API 签名表"——只给效果 → API 范围（函数名 + 关键参数 + 注意点）。
   要精确签名请用第 3 条。
5. 速查与本目录的原文快照均抓取于 2026-08-29；与最新官方文档冲突时以官方文档为准。

## 路径约定

本 skill 中出现的文件路径**一律相对 skill base directory**（即含 `SKILL.md` 的目录）：

| 写法 | 实际位置 |
| --- | --- |
| `references/INDEX.md` | 第 1 跳索引 |
| `references/topics/NN-*.md` | 第 2 跳主题详情 |
| `references/raw-doc/**/*.md` | 本地原文快照（可 grep） |

Markdown 链接（如 INDEX.md 里的 `topics/01-scene-setup.md`）按 Markdown 常规相对所在文件解析。

## 检索流程

- **第 1 跳**：`references/INDEX.md` — 效果检索词（中/英）→ 关键 API 范围 + 主题文件 + 原文档 URL
- **第 2 跳**：`references/topics/NN-*.md` — 主题详情：API 范围表、最小示例、相关效果与链接
- **第 3 跳**：`references/raw-doc/**` — 主题文件顶部列出的"源页快照"，含完整示例与源码级细节，适合 grep
- **精确签名**：被开发项目的 `node_modules/@babylonjs/lite/**.d.ts`
- **判据优先级**：`node_modules` 源码 > 本地快照（`raw-doc`）> 速查蒸馏（`INDEX` / `topics`）> 记忆

给 agent 的提示模板：

```text
本项目使用 @babylonjs/lite（原生工厂函数 API，非 @babylonjs/core 类式 API）。
我要实现「<效果描述>」。请先查 <skill-base>/references/INDEX.md 定位该效果的 API 范围与文档链接，
必要时读 <skill-base>/references/topics/ 下对应主题文件看最小示例，
更深细节 grep <skill-base>/references/raw-doc/；
若 API 细节仍不明确，请直接读取 node_modules/@babylonjs/lite 的 .d.ts 源码确认签名。
```

## 数据说明与更新

- 抓取源：https://doc.babylonjs.com/lite/ 左侧菜单全部 61 页（抓取时间 2026-08-29），另加 `_nav-index.md` 菜单索引共 62 个文件。
- 抓取快照：`references/raw-doc/`（每页头部含 `source:` 原始 URL 与 `title` / `section` 元信息）。
- 蒸馏速查：`references/INDEX.md` + `references/topics/`（13 个主题），由脚本提取 + AI 蒸馏生成。
- 中间提取数据（每页函数清单 / 章节结构 / BJS→Lite 对照表）保存在原项目 `.firecrawl/build/`，**未随本仓库分发**。
- 刷新流程与校验脚本见仓库根 `AGENTS.md`。
