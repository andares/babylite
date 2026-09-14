# babylite

[![skills.sh](https://skills.sh/b/andares/babylite)](https://skills.sh/andares/babylite)
[![npm](https://img.shields.io/npm/v/@andares/babylite.svg)](https://www.npmjs.com/package/@andares/babylite)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

一个 **agent skill**：把 [Babylon Lite](https://doc.babylonjs.com/lite/)（`@babylonjs/lite`）的官方文档做成**离线可查**的资料包。
装了它之后，agent 在写基于 `@babylonjs/lite` 的项目时，可以直接在本地查到"这个效果该调哪个 API、参数怎么传、坑在哪"，
**不需要联网检索，也不需要凭记忆猜签名**。

```bash
npx skills add andares/babylite          # 推荐：装到你的 agent（Claude Code / Cursor / Codex / DSH…）
npx @andares/babylite install            # 或走 npm
```

## 为什么需要它

`@babylonjs/lite` 是 Babylon.js 的 WebGPU 原生渲染器，API 形态是**工厂函数 + 纯数据实体**
（`createEngine` / `createSceneContext` / `addToScene` / `registerScene` / `startEngine`），
与 `@babylonjs/core` 的类式 API（`new Scene(engine)` / `new PBRMaterial()`）完全不同。
模型对 Babylon.js 全量版的记忆在这里是**负资产**：写出来的类式代码在 Lite 里根本不存在，而模型对 Lite 的细节记忆又很少。
本仓库用"离线快照 + 效果索引"补上这块，并顺手纠正类式 API 的惯性。

## 内容

```text
SKILL.md                      # skill 入口：检索协议 + 高频陷阱表
AGENTS.md                     # 项目说明与维护流程
package.json                  # npm 包 @andares/babylite（发布用）
bin/babylite.mjs              # 安装器 CLI：把 skill 复制进 agent 的 skill 目录
references/
├── INDEX.md                  # 第 1 跳：效果词（中/英）→ API 范围 + 主题文件 + 原文档 URL
├── README.md                 # 速查使用说明、铁律、数据来源
├── topics/                   # 第 2 跳：13 个主题（API 范围表 + 最小示例）
└── raw-doc/                  # 第 3 跳：官方 61 页完整 markdown 快照（可 grep）
scripts/verify-docs.mjs       # 链接、路径与 npm 包一致性校验
scripts/publish.mjs           # 一键发布（校验 → bump → commit+tag → npm publish → push）
```

三层资料的分工：**`INDEX.md` 回答"用哪个 API"**，**`topics/` 回答"怎么写"**，
**`raw-doc/` 回答"边界行为和完整选项是什么"**。

覆盖范围（13 个主题）：场景/引擎、相机与操控、灯光与阴影、模型与环境加载、PBR/标准材质、
着色器与后处理、动画（骨骼/morph/VAT）、网格几何与数学、GPU 拾取、粒子/精灵/文字/音频、
物理与 WebXR、无头渲染与性能工程、从 Babylon.js 迁移。

## 安装

skill 目录包要求 `SKILL.md` 位于 skill 目录根部，仓库根即 skill 目录。

**方式一：skills CLI（推荐）** — 从 [skills.sh](https://skills.sh/andares/babylite) 安装，自动识别你装了哪些 agent 并写入对应目录：

```bash
npx skills add andares/babylite                 # 交互式：选 agent 与作用范围
npx skills add andares/babylite -g -a claude-code -y   # 全局装到 Claude Code，非交互
npx skills add andares/babylite --list          # 只看仓库里有哪些 skill，不安装
```

**方式二：npm** — npm 装进 `node_modules`，agent 不会自动扫描，所以包内自带安装器把内容复制到 skill 目录：

```bash
npx @andares/babylite install              # → ~/.agents/skills/babylite
npx @andares/babylite install --project    # → ./.agents/skills/babylite
npx @andares/babylite install --to <dir>   # → 指定目录
npx @andares/babylite paths                # 查看各候选 skill 根目录
```

安装器只写目标目录、不执行包内任何脚本；目标目录非空且不是本 skill 的既有安装时会拒绝，需 `--force`。

**方式三：手动**（不装任何工具，适合固定版本或改文档后即时生效）：

```bash
git clone git@github.com:andares/babylite.git ~/.agents/skills/babylite
# 或从已有克隆软链过去（git pull 后立即生效）
ln -s /path/to/babylite ~/.agents/skills/babylite
```

按 agent 选择根目录：

| 作用范围 | 路径 |
| --- | --- |
| 单个项目 | `<项目根>/.agents/skills/babylite/` |
| 单个项目（DSH） | `<项目根>/.dsh/skills/babylite/` |
| 当前用户 | `~/.agents/skills/babylite/` |
| 当前用户（DSH） | `~/.dsh/skills/babylite/` |
| Claude Code / Cursor 等 | `~/.claude/skills/babylite/`、`~/.cursor/skills/babylite/` |

DeepSeek harness 也可用自带命令 `/skill install github:andares/babylite`。

安装后 skill 列表里应出现 `babylite`；若没出现，刷新/重启会话（本 skill 是纯文档包，无需 `trust` 就能读取）。

## 使用

装好后 agent 会在遇到 `@babylonjs/lite` 相关任务时自动加载本 skill 并按其检索协议查文档。
如果你要手动确认内容——人或 agent 都可以直接读：

```bash
# 从"效果"找 API（中/英检索词都行）
grep -n "大规模实例\|thin instance" references/INDEX.md

# 直接看某个主题
sed -n '1,60p' references/topics/08-meshes-geometry.md

# 在官方原文快照里全文检索（比速查更深）
grep -rn "setThinInstances" references/raw-doc/
```

对被开发项目而言，**最权威的签名来源仍是项目内 `node_modules/@babylonjs/lite/**.d.ts`**——它与安装版本严格一致。
本仓库的定位是"离线 + 快"，不是"权威"：判据优先级为 `node_modules` 源码 > `raw-doc` 快照 > `topics`/`INDEX` > 模型记忆。

## 数据来源与时效

- 抓取源：<https://doc.babylonjs.com/lite/> 左侧菜单全部 **61 页**（另加 `_nav-index.md` 菜单索引）。
- 抓取时间：**2026-08-29**；每个快照文件头部保留 `title` / `source`（原始 URL）/ `section`。
- 与线上文档冲突时**以官方文档为准**；刷新流程见 `AGENTS.md`，改完跑 `node scripts/verify-docs.mjs` 校验。
- 官方文档更新快于本快照，欢迎提 issue 提醒刷新。

## 发布（维护者）

```bash
npm run release patch     # 1.0.0 → 1.0.1；也支持 minor / major
npm run release patch -- --dry-run    # 只打印计划
npm run release patch -- --no-push    # 发 npm 但不 push / 不建 GitHub Release
```

一条命令完成：校验 → bump `package.json` 与 `SKILL.md` 版本 → commit + tag → `npm publish` →
push 分支与 tag → 建 GitHub Release（需 `GITHUB_TOKEN`，缺省只提示）。发布后 skills.sh 会随仓库同步。
细节与回滚见 `AGENTS.md`。

## 许可

本仓库整理内容以 [MIT](LICENSE) 发布；文档原文版权归 Babylon.js 项目所有（其公开文档随 Babylon.js 以 Apache-2.0 发布）。
