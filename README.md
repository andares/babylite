# babylite

[![skills.sh](https://skills.sh/b/andares/babylite)](https://skills.sh/andares/babylite)
[![npm](https://img.shields.io/npm/v/@andares/babylite.svg)](https://www.npmjs.com/package/@andares/babylite)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**English** · [中文](README.zh-CN.md)

An **agent skill** that packages the official [Babylon Lite](https://doc.babylonjs.com/lite/) (`@babylonjs/lite`)
documentation as an **offline, greppable reference pack**. Once installed, an agent working on a `@babylonjs/lite`
project can find locally *which API produces an effect, how its parameters are passed, and where the traps are* —
**without web searching, and without guessing signatures from memory**.

```bash
npx @andares/babylite install     # recommended: one install in the shared ~/.agents/skills/, discovered by Pi / DSH / Codex / Cursor…
```

## Why this exists

`@babylonjs/lite` is the WebGPU-native renderer of Babylon.js, and its API is **factory functions + plain data
entities** (`createEngine` / `createSceneContext` / `addToScene` / `registerScene` / `startEngine`) — nothing like
the class-style API of `@babylonjs/core` (`new Scene(engine)` / `new PBRMaterial()`). A model's memory of full
Babylon.js is an **active liability** here: the class-style code it produces does not exist in Lite, while its
store of Lite specifics is thin. This repo closes that gap with an "offline snapshot + effect index", and
corrects the class-style reflex along the way.

## Contents

```text
SKILL.md                      # skill entry point: retrieval protocol + high-frequency trap table
AGENTS.md                     # project notes and maintenance workflow
README.md                     # this file (English, default)
README.zh-CN.md               # the same README in Chinese
CHANGELOG.md                  # release history (each release prepends its section)
package.json                  # npm package @andares/babylite (release metadata, managed with pnpm)
pnpm-lock.yaml                # pnpm lockfile
bin/babylite.mjs              # installer CLI: copies the skill into an agent's skill directory
references/
├── INDEX.md                  # hop 1: effect keywords (EN/ZH) → API surface + topic file + upstream URL
├── README.md                 # quick-reference rules, lookup protocol, data provenance
├── topics/                   # hop 2: 13 topics (API surface tables + minimal examples)
└── raw-doc/                  # hop 3: full markdown snapshot of all 61 official pages (greppable)
scripts/verify-docs.mjs       # link, path and package consistency checks
scripts/publish.mjs           # one-command release (verify → bump → commit+tag → pnpm publish → push)
```

The three layers divide the work: **`INDEX.md` answers "which API"**, **`topics/` answers "how do I write it"**,
**`raw-doc/` answers "what are the edge cases and the full option lists"**.

Coverage (13 topics): engine/scene setup, cameras & controls, lights & shadows, asset and environment loading,
PBR/standard materials, shaders & post-processing, animation (skeleton/morph/VAT), mesh geometry & math, GPU
picking, particles/sprites/text/audio, physics & WebXR, headless rendering & performance engineering, and
porting from Babylon.js.

## Install

The skill is just a directory package (`SKILL.md` + `references/`). **Installing it once into the shared skill
directory is enough — no per-agent installs, no `-a` flag.**

### Recommended: the shared directory

```bash
npx @andares/babylite install            # → ~/.agents/skills/babylite (available to every project)
npx @andares/babylite install --project  # → ./.agents/skills/babylite (this project only)
```

> ⚠️ **Do not run `npx @andares/babylite …` from inside this repository**: the package name matches the local
> project, so npm resolves it to *this* package instead of downloading from the registry, then looks for
> `./node_modules/.bin/babylite`, which does not exist, and fails with `sh: 1: babylite: not found`
> (`npx --package …` behaves the same). Run it from any other directory; if you are inside this repo, call
> `node bin/babylite.mjs install` directly, or use the symlink approach below. That failure is npm's
> behaviour, not this package's.

`.agents/skills/` is the shared directory the ecosystem is converging on, so one install is discovered by:

- **Global** `~/.agents/skills/`: Pi, DSH, Zed, Cline, Dexto, Kimi Code CLI, Loaf, Sarvam Code, Warp
- **Project-level** `.agents/skills/` reaches further: Codex, Cursor, GitHub Copilot, Gemini CLI, OpenCode, Kilo Code, Antigravity, Droid and more (20+ agents)
- Pi additionally accepts `~/.pi/agent/skills/` and `<project>/.pi/skills/`; DSH additionally accepts `~/.dsh/skills/` — normally unnecessary

The installer only writes `SKILL.md` + `references/` into the target directory: **it executes nothing from the
package and touches no network.** An existing install of this skill is updated in place; a directory it did not
create is refused unless you pass `--force`. A **symlinked target is always refused**, on purpose: a symlink
already *is* an installation (usually a live git checkout), and copying through it would rewrite — or delete —
whatever it points at.

### Agents outside the shared convention

The `skills` CLI **auto-detects** which agents you have, and lays down symlinks in their own directories — one
canonical copy plus symlinks, not duplicate copies (`--copy` really copies):

```bash
npx skills add andares/babylite        # auto-detect; asks which agents to install for
npx skills add andares/babylite --all  # every skill → every agent, no prompts
```

Use it for Claude Code (`~/.claude/skills/`) and similar. DSH is not in that CLI's agent list, so DSH uses the
command above or `/skill install github:andares/babylite`.

> ⚠️ Do not use `-g -a universal`: that CLI maps `universal`'s **global** path to `~/.config/agents/skills/`,
> which is **not** on the shared convention and is read by neither Pi nor DSH. (Its project-level path
> `.agents/skills/` is the correct one.)

### Manual install / pinning a version

```bash
git clone git@github.com:andares/babylite.git ~/.agents/skills/babylite

# or symlink an existing clone; `git pull` then takes effect immediately
ln -s /path/to/babylite ~/.agents/skills/babylite
```

**Editing the docs inside this repo and wanting it live right away? Use the symlink** (no repeated
re-installs); that is what contributors use. Note that the installer refuses a symlinked target — the link
itself is the installation, so run `git pull` in the linked directory instead of installing again.

### Where skills are read from

| Scope | Path | Read by |
| --- | --- | --- |
| Global (recommended) | `~/.agents/skills/babylite/` | Pi, DSH, Zed, Cline, Warp… |
| Current project (recommended) | `<project root>/.agents/skills/babylite/` | the above + Codex, Cursor, Copilot, Gemini CLI, OpenCode… |
| DSH-specific | `~/.dsh/skills/`, `<project root>/.dsh/skills/` | DSH only (normally unnecessary) |
| Agent-specific | `~/.claude/skills/`, `~/.cursor/skills/`… | let `npx skills add` handle it |

After installing, `babylite` should appear in the skill list; if it does not, refresh or restart the session
(this is a pure documentation pack, so no `trust` step is needed to read it).

## Usage

Once installed, the agent loads this skill automatically for `@babylonjs/lite` tasks and follows its retrieval
protocol. To inspect the content by hand — people and agents alike can read it directly:

```bash
# find an API from an effect (English or Chinese keywords)
grep -n "thin instance\|大规模实例" references/INDEX.md

# read one topic
sed -n '1,60p' references/topics/08-meshes-geometry.md

# full-text search the official snapshot (deeper than the distilled quick reference)
grep -rn "setThinInstances" references/raw-doc/
```

Inside the project that consumes it, **the most authoritative signature source is that project's
`node_modules/@babylonjs/lite/**.d.ts`**, which matches the installed version exactly. This repo aims to be
"offline and fast", not "authoritative": precedence is `node_modules` source > `raw-doc` snapshot >
`topics`/`INDEX` > model memory.

## Snapshot freshness (is this up to date?)

- Source: every page in the left-hand menu of <https://doc.babylonjs.com/lite/> — **61 pages** plus a
  `_nav-index.md` menu index.
- Captured: **2026-08-29**. Each file under `references/raw-doc/` keeps `title` / `source` (the original URL) /
  `section` in its header, so a local file and its upstream page can always be cross-checked.
- **The upstream docs move faster than the snapshot.** For anything newer, read the official site
  <https://doc.babylonjs.com/lite/> — on conflict the official docs win. The skill's own protocol says the same
  and lists when to leave the snapshot: the API is not found locally (added or renamed since the capture); the
  project's installed `@babylonjs/lite` is newer than the snapshot; you need to know whether a capability is
  supported *now*; or the user explicitly asks for the latest documentation.
- Issues asking for a refresh are welcome; the refresh procedure and checks live in `AGENTS.md`.

## Development & release (maintainers)

This repository uses **pnpm only** for its own development workflow (its `packageManager` is pinned and the
lockfile is `pnpm-lock.yaml`); the package itself is still published to the npm registry. The user-facing
install commands above are unaffected by that.

```bash
pnpm install                     # no dependencies; keeps the lockfile in sync
pnpm verify                      # run the checks (equivalent to node scripts/verify-docs.mjs)
pnpm release patch               # 1.0.1 → 1.0.2; minor / major also work
pnpm release patch --dry-run     # print the plan only
pnpm release patch --no-push     # publish without pushing / creating a GitHub Release
pnpm gh-release v1.0.1           # backfill the GitHub Release for an already-pushed tag
pnpm tag-current                 # tag the current version locally (skipped if the tag exists)
```

One command does it all: push preflight (`git push --dry-run`, so a push that would fail stops the release before
anything is changed) → verify → bump `package.json` + the `SKILL.md` version and prepend the `CHANGELOG.md` entry →
commit + tag → `pnpm publish` → push branch and tag → create the GitHub Release. The changelog entry and the Release
notes cover the same range: the commits since the previous tag. The token must be allowed to write Releases (fine-grained: `Contents: Read and write`; classic: `repo`). If
`GITHUB_TOKEN` is missing or the Release call fails, the run only warns — the registry publish stands — and
`pnpm gh-release vX.Y.Z` repairs it afterwards (idempotent: an existing Release is left alone). skills.sh picks the change up once the public repo is pushed.
Details and rollback: `AGENTS.md`.

Run the release from your own terminal: it needs a real TTY, so an agent, a pipe or a wrapper script gets a
refusal *before* anything is bumped, tagged or published. The script pushes the branch and tag itself, so
`git push && pnpm release patch` is not the flow — the release command alone is enough.

> ⛔ Pushing and publishing are reserved for the repository owner. Agents may run `pnpm verify`, `pack --dry-run`
> and `pnpm release --dry-run`, and may commit locally — nothing that changes public state.

## License

The curated content of this repository is released under [MIT](LICENSE); the documentation text itself belongs
to the Babylon.js project (its public docs ship with Babylon.js under Apache-2.0).
