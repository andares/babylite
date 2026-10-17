# AGENTS.md

给在本仓库工作的 agent 的项目说明。**先读完本文件再动手改任何东西。**

> ## ⛔ 发布权：只能由仓库所有者（人类）执行
>
> **人类专属操作**（agent 一律不得执行，也不得"为了验证"在临时目录、副本、容器、worktree 里执行）：
>
> 1. **推送**：`git push`（含 `--tags`、`--force`）、`git push --delete`、创建或删除远端 tag / 分支；
> 2. **发布**：`pnpm release`、`pnpm publish`、`npm publish`、`pnpm unpublish`、`npm deprecate`；
> 3. **GitHub Release**：创建、修改、删除（包括 `pnpm gh-release`）。
>
> **agent 可以做的**：`pnpm verify`、`pnpm pack --dry-run`、`pnpm release <bump> --dry-run`、
> 修改版本号与文档、**本地 `git commit`**、本地打 tag（可选）。做完本地提交后停下，
> 把"已完成 N 个本地提交 + tag，请推送"报告给人类。
>
> 原因：npm 版本号一旦发布**永久不可复用**，公开包可被任何人下载；远端 push 会立刻改变
> 所有人都能看到的状态。本仓库已经因为一个 agent 在 `/tmp` 副本里跑 release 脚本，误发了
> `@andares/babylite@1.0.1`（2026-09-14）——**在副本里跑同样是真的发布到公开 registry**。
>
> 这条**只靠纪律执行，脚本不自设门**：2026-10-17 按所有者要求拆掉了脚本里的终端检查与确认提问——
> 每次发版多一道交互的代价高于它挡住的错误。也就是说，**本文件就是唯一的约束**，没有机制兜底：
> 读到这条即视为已知悉，而越界一次就是真实、不可回滚的公开操作（npm 版本号永久占用、远端状态立刻改变）。

## 项目是什么

本仓库是**一个 agent skill**，把 Babylon Lite（`@babylonjs/lite`）的官方文档做成**离线可查**的资料包，
让 agent 在开发基于 `@babylonjs/lite` 的项目时，能直接从本仓库内的文档拿到 API 事实，**不必联网检索、也不靠记忆**。

- 交付形态：skill 目录包 `<name>/SKILL.md`，仓库根即 skill 目录，`name: babylite`。
- 分发渠道：**公开 GitHub 仓库**（skills.sh 直接索引，`npx skills add andares/babylite`）
  与 **npm 包 `@andares/babylite`**（含安装器 CLI，`npx @andares/babylite install`）。
- **共享目录事实（别再搞错）**：`~/.agents/skills/`（全局）与 `.agents/skills/`（项目级）是生态正在收敛的
  共享 skill 目录，**Pi 与 DSH 都读它**。所以推荐装一次到 `~/.agents/skills/`；不需要按 agent 分别安装，
  也不需要写 `-a`（`skills` CLI 默认自动探测已装 agent）。该 CLI 只对**不在**此约定里的 agent 才需要用到
  （如 Claude Code 的 `~/.claude/skills/`）；注意它的 `universal` **全局**路径是 `~/.config/agents/skills/`，
  不在这套约定上。
- 目标使用者：在被开发项目中写 Babylon Lite 代码的 agent（不是本仓库的开发工具）。
- 不提供：`@babylonjs/lite` 的源码、可运行示例工程。本仓库**只有文档 + 一个安装器**。

Babylon Lite 是 Babylon.js 的 WebGPU 原生渲染器，API 形态是**工厂函数 + 纯数据实体**，
与 `@babylonjs/core` 的类式 API 完全不同——这正是需要一个专门速查 skill 的原因。

## 目录结构

```text
.
├── SKILL.md                  # skill 入口：触发描述 + 检索协议 + 高频陷阱（agent 实际读到的文件）
├── AGENTS.md                 # 本文件：项目说明与维护流程
├── README.md                 # 面向人的介绍与安装方式（**英文，默认展示的那一份**，见约定 13）
├── README.zh-CN.md           # 同一份说明的中文版
├── CHANGELOG.md              # 版本变更记录（每个 release 自动 prepend 一节，见约定 14）
├── LICENSE
├── package.json              # npm 包 @andares/babylite（发布与版本，见约定 8–9）
├── pnpm-lock.yaml            # pnpm 锁文件（本仓库只用 pnpm，见「包管理器」一节）
├── bin/babylite.mjs          # 安装器 CLI：把 skill 复制进 agent 的 skill 目录
├── references/               # 全部资料，随 skill 一起分发
│   ├── INDEX.md              # 第 1 跳：效果词（中/英）→ API 范围 + 主题文件 + 原文档 URL
│   ├── README.md             # 速查自身的使用说明、铁律、数据来源
│   ├── topics/               # 第 2 跳：13 个主题，含 API 范围表 + 最小示例 + 源页清单
│   │   └── NN-*.md
│   └── raw-doc/              # 第 3 跳：官方 61 页的完整 markdown 快照（可 grep），另含 _nav-index.md
│       ├── 0N-*.md
│       └── architecture/NN-*.md
└── scripts/
    ├── verify-docs.mjs       # 校验：链接、路径、包一致性
    ├── publish.mjs           # 一键发布：预检 → 校验 → bump → commit+tag → pnpm publish → push
    ├── github-release.mjs    # 给已推送的 tag 建/补建 GitHub Release（幂等，notes 自动生成）
    └── tag-current.mjs       # 给当前版本打本地 tag（已存在则跳过）
```

`references/topics/` 与 `references/raw-doc/` 的区别：
**topics 是蒸馏结果**（人读，回答"用哪个 API"），**raw-doc 是原文快照**（机器 grep，回答"边界行为/完整选项是什么"）。

## 包管理器：只用 pnpm

本仓库**自己的开发流程只用 pnpm**，不要用 npm/yarn 跑本仓库的命令：

| 场景 | 用 | 不要用 |
| --- | --- | --- |
| 安装/同步锁文件 | `pnpm install` | `npm install`、`yarn` |
| 跑脚本 | `pnpm verify` / `pnpm release` / `pnpm tag-current` | `npm run ...` |
| 打包检查 | `pnpm pack --dry-run --json` | `npm pack` |
| 发布 | `pnpm publish --no-git-checks` | `npm publish` |
| 锁文件 | `pnpm-lock.yaml` | `package-lock.json`、`yarn.lock` |

- `package.json` 的 `packageManager` 固定 pnpm 版本；`verify-docs.mjs` 会检查该字段、
  `pnpm-lock.yaml` 是否存在，以及有没有混进 npm/yarn 的锁文件。
- **`prepublishOnly` 生命周期钩子名不改**：它是 npm 与 pnpm 共用的标准钩子名，`pnpm publish` 同样会触发。

### pnpm（包管理器）与 npm（registry）不是一回事

本包**发布到 npm registry**（`npmjs.com`、`img.shields.io/npm/...` 徽章、`npx @andares/babylite install`
这类**用户侧**安装命令都保持 npm/npx 写法，这是发行渠道，不改）。上表里的 pnpm 只约束**本仓库的开发与发布流程**。

## 不得破坏的约定

1. **路径一律相对 skill base directory**（仓库根）。
   `references/INDEX.md`、`references/raw-doc/architecture/06-pbr-material.md` 这类写法在 SKILL.md、topics 头部、
   参考文档中都表示"相对仓库根"。不要引入 `../`、绝对路径或 `babylite/` 前缀。
2. **raw-doc 的文件名与官方 URL 路径一一对应**，且每个文件头部的 YAML 保留 `title` / `source` / `section`。
   改文件名或删字段会让 `INDEX.md` 里的原文档 URL 无法与本地文件互查。
3. **不要手改 raw-doc 的正文**。它是快照，只允许整体替换（刷新）；要补充解读请写进 `topics/`。
4. **topics 头部必须列出该主题的源页快照路径**（第 3 跳入口）。这是 topics 与 raw-doc 之间的唯一定位关系。
5. **速查不给完整签名表**。精确签名属于被开发项目的 `node_modules/@babylonjs/lite/**.d.ts`；
   不要把猜测的签名写进 topics 当作事实。速查只写"效果 → API 范围 → 要点/陷阱"。
6. **判据优先级**：`node_modules` 源码 > `raw-doc` 快照 > `topics`/`INDEX` 蒸馏 > 模型记忆。
   凡写入本仓库的 API 事实，必须能在 `raw-doc` 中找到出处。
7. **SKILL.md 的 frontmatter 必须保持有效**：`name` 为 kebab-case（当前 `babylite`），`description` 面向触发匹配、
   前 200 字符内出现最关键触发词。frontmatter 解析失败会导致整个 skill 被静默丢弃。
8. **版本号只有一个事实来源的两个副本**：`package.json` 的 `version` 与 `SKILL.md` 的 `metadata.version` 必须相等。
   改版本请走 `pnpm release`（它同时写两处），不要手改其一；`verify-docs.mjs` 会拦截不一致。
9. **`package.json` 的 `files` 必须覆盖 `SKILL.md` 与 `references`**，否则装出来的包缺文档。
   `scripts/` 与 `bin/` 之外不要新增需要随包分发的顶层目录而不更新 `files`。
10. **安装器只做复制，不做别的**：`bin/babylite.mjs` 只往目标 skill 目录写 `SKILL.md` + `references/`，
    不得执行包内脚本、不得联网、不得越出目标目录；覆盖他人目录必须要求 `--force`。
    目标是**符号链接**（或真实路径就是本源目录）时必须**直接拒绝**：软链本身就算一种安装
    （通常是跟着 `git pull` 走的 checkout），写穿链接会改写——甚至删掉——链接背后的目录，
    而指向本源时更会把正在复制的源删掉（2026-10-17 查明并修好）。
11. **本仓库只用 pnpm**：不要引入 `package-lock.json`/`yarn.lock`，不要用 `npm run`/`npm publish` 跑本仓库流程；
    用户侧的 `npx ...` 安装说明不在此约束内。
12. **推送与发布只能由人类执行**（本文件最重要的一条）：agent 不得运行 `git push`（含 `--tags`/`--force`）、
    创建或删除远端 tag / GitHub Release（含 `pnpm gh-release`），也不得运行 `pnpm release`、`pnpm publish`、`npm publish`、
    `pnpm unpublish`——包括在临时目录、副本、容器、worktree 里"为了验证"地跑。
    agent 做到**本地 commit** 为止，然后向人类报告并请求推送。
    **脚本已不自设门**（见文首「发布权」）：没有第二道保险，这条禁令完全依赖纪律执行。
    细节见文首[「发布权」](#-发布权只能由仓库所有者人类执行)一节。
13. **README 是一对**：`README.md` 是英文（默认，GitHub / npm 展示的那份），`README.zh-CN.md` 是中文版；
    两版章节结构保持一致、改动同步更新，并在文首**互相链接**。
    `verify-docs.mjs` 会检查两份都在且互链，防止其中一份悄悄腐化。
14. **`CHANGELOG.md` 顶部版本 = `package.json` 版本**：每个 release 由 `publish.mjs` 在顶部插入一节
    （自上个 tag 以来的提交主题，与 GitHub Release 同一段范围），不要手改历史条目；
    `verify-docs.mjs` 会对照两处版本，因此 `prepublishOnly` 能把"漏写条目"的发布拦下来。

## 作为使用方（在被开发项目中）

agent 被加载本 skill 后，按 SKILL.md 的检索协议走：`references/INDEX.md` → `references/topics/NN-*.md`
→ `references/raw-doc/**` → 项目内 `node_modules/@babylonjs/lite/**.d.ts`。
核心提醒：**先在本 skill 内查，不要先联网**；只有在本地快照确实没有、或怀疑已随版本变更时，
才按第 5 跳去官方最新文档 https://doc.babylonjs.com/lite/ ；Lite 用工厂函数，不要写 `@babylonjs/core` 的类式代码。

## 作为维护方（更新本仓库）

### 刷新流程（上游文档变更时）

1. 重新抓取 https://doc.babylonjs.com/lite/ 左侧菜单全部页面，产出新的 `raw-doc/` 快照；
   保持"文件名 ↔ URL 路径"对应与文件头 `title` / `source` / `section` 元信息。
2. 更新 `references/raw-doc/_nav-index.md` 的菜单索引表。
3. 依据新快照重新蒸馏 `references/INDEX.md` 与 `references/topics/`，并同步更新
   每个 topic 头部的"源页快照"路径清单。
4. 更新三处版本标记：`SKILL.md` 的 `metadata.docs-snapshot`、`references/README.md` 的抓取时间与页数、
   本文件的约定（如有变化）。
5. 跑校验脚本（下节），全绿才算完成。

### 校验

```bash
pnpm verify          # 等价 node scripts/verify-docs.mjs
```

校验内容：`SKILL.md` frontmatter 必需字段与 kebab-case 名称；`INDEX.md` 中所有 `topics/*.md` 链接存在；
所有 topic 头部列出的 `references/raw-doc/**` 路径存在；全仓库 markdown 内部链接可解析；
文档中不存在 `babylite/` 前缀或指向仓库外的相对路径；`raw-doc` 页数与 `_nav-index.md` 记录一致；
`package.json` 存在且名称/版本/`files`/`bin` 与 skill 包一致（约定 8–10）；
`packageManager` 固定 pnpm、`pnpm-lock.yaml` 存在且没有混入 npm/yarn 锁文件（约定 11）；
两份 README（`README.md` / `README.zh-CN.md`）都存在且互相链接（约定 13）；
`CHANGELOG.md` 存在且顶部版本等于 `package.json` 版本（约定 14）。

### 发布与分发

> ⛔ 下面这些命令**只能由仓库所有者（人类）执行**。agent 只允许跑 `--dry-run` 形式与
> `pnpm verify`（见文首[「发布权」](#-发布权只能由仓库所有者人类执行)）。

```bash
pnpm release patch                  # 1.0.1 → 1.0.2（也支持 minor / major）
pnpm release patch --dry-run        # 只打印计划，不改任何东西（agent 可以跑）
pnpm release patch --no-push        # 发布到 registry，但不 push、不建 GitHub Release
pnpm release patch --yes            # 兼容占位：现在不再提问/不检查终端，加不加都一样
pnpm gh-release v1.0.1              # 给已推送的 tag 补建 GitHub Release（幂等）
pnpm gh-release v1.0.1 --update     # 重写已存在 Release 的 notes（取自 CHANGELOG.md 对应小节）
pnpm tag-current                    # 仅给当前版本打本地 tag（已存在则跳过）
```

`scripts/publish.mjs` 的步骤：**push 预检**（`git push --dry-run`，不通就什么都不改）
→ 校验（`verify-docs.mjs` + `pnpm pack --dry-run --json` 检查 tarball 内容）
→ 同时 bump `package.json` 与 `SKILL.md` 的 `metadata.version`，并在 `CHANGELOG.md` 顶部插入本版条目
（自上个 tag 以来的提交主题；与 Release notes 同一段范围）→ `chore: release vX.Y.Z` commit
→ `tag-current.mjs` 打 `vX.Y.Z` → `pnpm publish --no-git-checks`（`prepublishOnly` 会再跑一次校验）
→ 仅在发布成功后 push 分支与 tag，再调 `scripts/github-release.mjs` 建 GitHub Release
（`GITHUB_TOKEN`，best-effort，失败只警告；notes 取 `CHANGELOG.md` 对应小节）。

预检存在的理由：registry 写入发生在 push 之前，push 失败会把版本停在"npm 有、GitHub 没有"的状态，
所以拿不到 push 权限、或远端已经领先时，要在改任何东西之前就停下来。

**Release 缺失怎么补**：`pnpm gh-release vX.Y.Z`（`scripts/github-release.mjs`）是幂等的——已存在就跳过；tag 不在 `origin` 上则拒绝（否则 API 会拿默认分支 HEAD 新建一个 tag，把 Release 指到错提交）。
典型来源：发布时没设 `GITHUB_TOKEN`，或版本早于这一步存在（`v1.0.1` 就是"有 tag、没有 Release"）。

**Release notes 取自 `CHANGELOG.md`** 对应小节（同一段提交范围）；已存在的 Release 不动，
要把它现有的 notes 重写成 changelog 内容就加 `--update`。
不用 GitHub 自己的 `generate_release_notes`，是因为它只列已合并的 PR，而本仓库直接推 master——
生成出来只有一行 compare 链接（`v1.1.0` / `v1.1.1` 就是这么诞生的，可用 `--update` 补好）。

**Token 权限（漏掉就会 403）**：`GITHUB_TOKEN` 必须能**写** Release —— fine-grained token 要
`Contents: Read and write`（Releases 属于 Contents 权限；只给读权限时仓库/读操作都能过，唯独写 Release 403），
classic token 要 `repo`（公开仓库 `public_repo` 即可）。`github-release.mjs` 会把 401/403 翻译成
"你这颗 token 该加什么权限"，并给出无 token 备选（`gh auth login` + `gh release create <tag> --generate-notes`）。
此时 npm 已发布、push 已成功，只差 Release，补建即可。

**`git push && pnpm release` 不是流程**：push 本来就在 release 脚本的最后一步，先推只会把"未发布"的提交
放到默认分支上（skills.sh 读的正是默认分支）。直接跑 `pnpm release <bump>` 即可——脚本不再提问、也不检查终端；
**agent 不得执行发布与 push**，这是本文件的常驻规则（见文首「发布权」与约定 12）。

发布失败回滚：`git tag -d vX.Y.Z && git reset --hard HEAD~1`。

**发布前的身份校验（重要）**：`publish.mjs` 在改动任何文件之前会确认 `origin` 存在且与
`package.json` 的 `repository.url` 指向同一仓库；不匹配就中止。原因是 **npm 版本号一旦发布就不可复用**，
在临时克隆或副本里误跑一次就会永久占掉一个版本（本仓库已被这个坑咬过一次：`1.0.1` 于 2026-09-14 被误发布）。
只有确实要从非规范 checkout 发布时才用 `--force-publish` 覆盖。

**两个渠道的关系**：

| 渠道 | 来源 | 安装方式 | 说明 |
| --- | --- | --- | --- |
| skills.sh | 公开 GitHub 仓库 | `npx skills add andares/babylite` | **无需注册、无需提交、无需审核**：skills.sh 索引公开 GitHub 仓库中的 `SKILL.md`（仓库根即可）。所以发布 = push 到公开仓库 |
| npm registry | package.json | `npx @andares/babylite install` | 包装到 `node_modules/`，agent 不扫描该目录，故包内 `bin` 安装器负责复制进 skill 目录 |

skills.sh 注意点：

- 榜单按 `skills` CLI 的匿名安装遥测排序；**仓库要先被装过一次**（例如自己跑一次 `npx skills add andares/babylite`）
  才会出现在榜单/仓库页上。
- 可选：仓库根加 `skills.sh.json` 自定义仓库页分组；本仓库只有一个 skill，**不需要**。
- README 里的徽章 `https://skills.sh/b/andares/babylite` 在收录后才会显示数字。
- 若仓库转为私有，skills.sh 将不再能索引。
- 不得提交隐藏安装脚本或凭证收集代码；`bin/babylite.mjs` 的行为约束见约定 10。

### 改动前的检查清单

- 改文档后必须重跑 `pnpm verify`，并人工抽查 3 个 topic 的链接可达。
- 新增 API 事实必须同时在 `topics/` 与该主题的 `raw-doc` 源页中可查；只有 topics 有、raw-doc 没有的，视为待核实。
- 不要在 `references/` 下新增二进制、图片或大规模冗余文件：skill 会在安装时整体复制。
- 改 README 的内容时**两版一起改**，并确认文首互链仍在（约定 13；`pnpm verify` 会拦）。

## 来源与许可

- 文档内容来自 Babylon.js 官方文档 https://doc.babylonjs.com/lite/ （Apache-2.0 项目的公开文档），
  抓取快照时间为 2026-08-29；每页头部保留 `source:` 原始 URL。
- 本仓库代码与整理内容以 MIT 许可发布（见 `LICENSE`）。
- 上游文档更新快于本快照，且以官方文档为准；本仓库的价值是**离线与检索速度**，不是权威性。
