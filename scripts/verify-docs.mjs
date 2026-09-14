#!/usr/bin/env node
/**
 * Verifies the integrity of this documentation-only skill bundle.
 *
 * The skill's whole value is that an agent can follow a path written in one
 * document and land on the document that answers the question. Every check
 * below protects one of those promises:
 *
 *  1. SKILL.md frontmatter parses and keeps its required shape (`name` kebab-case).
 *  2. Every doc page the navigation index claims exists, and the counts agree.
 *  3. Every `references/...` path written in inline code resolves.
 *  4. Every relative Markdown link resolves inside the repository.
 *  5. The retired `babylite/...` prefix never comes back.
 *  6. The snapshot date stays consistent between SKILL.md and references/README.md.
 *  7. The published package stays consistent with the bundle: name, the version
 *     shared with `SKILL.md` metadata, `files` coverage, executable bins, and
 *     the pnpm-only toolchain (packageManager field + lockfile).
 *
 * Usage: node scripts/verify-docs.mjs
 */

import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

/** Records a failure under a named check. */
function fail(check, message) {
  failures.push(`${check}: ${message}`);
}

/** Lists every file under `dir` recursively, as repository-relative POSIX paths. */
function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile()) out.push(relative(ROOT, full).split(sep).join('/'));
  }
  return out;
}

const allFiles = walk(ROOT).sort();
const markdownFiles = allFiles.filter((p) => p.endsWith('.md'));

if (markdownFiles.length === 0) {
  console.error('verify-docs: no markdown files found under', ROOT);
  process.exit(1);
}

/** Removes fenced code blocks so examples and directory trees are not parsed as links. */
function stripFences(text) {
  return text.replace(/^([ \t]*)(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1?\2[^\n]*$/gm, '');
}

/** Reads a markdown file and returns its content plus the fence-free variant. */
function loadMarkdown(relPath) {
  const raw = readFileSync(join(ROOT, relPath), 'utf8');
  return { raw, prose: stripFences(raw) };
}

// ---------------------------------------------------------------- 1. frontmatter

const skill = loadMarkdown('SKILL.md');
const frontmatter = /^---\n([\s\S]*?)\n---/.exec(skill.raw);
if (frontmatter === null) {
  fail('frontmatter', 'SKILL.md does not start with a YAML frontmatter block');
} else {
  const block = frontmatter[1];
  const name = /^name:[ \t]*(.+?)[ \t]*$/m.exec(block)?.[1];
  const description = /^description:[ \t]*(.+?)[ \t]*$/m.exec(block)?.[1];
  if (name === undefined) fail('frontmatter', 'missing required `name`');
  else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
    fail('frontmatter', `\`name: ${name}\` is not kebab-case`);
  } else if (name !== 'babylite') {
    fail('frontmatter', `\`name: ${name}\` no longer matches the repository/skill name`);
  }
  if (description === undefined) {
    fail('frontmatter', 'missing required `description`');
  } else if (description.length > 1024) {
    fail('frontmatter', `description is ${description.length} chars; keep trigger text under 1024`);
  }
  for (const field of ['whenToUse', 'metadata']) {
    if (!new RegExp(`^${field}:`, 'm').test(block)) {
      fail('frontmatter', `missing expected \`${field}\``);
    }
  }
}

// ------------------------------------------------------------- 2. raw-doc inventory

const rawDir = join(ROOT, 'references/raw-doc');
if (!existsSync(rawDir)) {
  fail('raw-doc', 'references/raw-doc is missing');
} else {
  const pages = walk(rawDir)
    .filter((p) => p.endsWith('.md') && !p.endsWith('/_nav-index.md'))
    .map((p) => p.slice('references/raw-doc/'.length));
  const navPath = 'references/raw-doc/_nav-index.md';
  if (!existsSync(join(ROOT, navPath))) {
    fail('raw-doc', `${navPath} is missing`);
  } else {
    // Rows look like: `| Welcome | [00-welcome.md](00-welcome.md) | <https://…> |`
    const navRows = [...loadMarkdown(navPath).prose.matchAll(/^\|[^|\n]*\|\s*\[[^\]]+\]\(([^)]+)\)/gm)].length;
    if (navRows !== pages.length) {
      fail('raw-doc', `_nav-index.md maps ${navRows} pages but ${pages.length} snapshots exist`);
    }
  }
}

// ------------------------------------------- 3. inline `references/...` path mentions

const BACKTICKED = /`([^`\n]+)`/g;
for (const relPath of markdownFiles) {
  const { prose } = loadMarkdown(relPath);
  for (const match of prose.matchAll(BACKTICKED)) {
    const token = match[1].trim();
    if (!token.startsWith('references/')) continue;
    if (/[*<>]/.test(token)) continue; // glob or placeholder, not a concrete path
    const target = resolve(ROOT, token.replace(/\/$/, ''));
    if (!existsSync(target)) {
      fail('path-mention', `${relPath} references missing \`${token}\``);
    } else if (token.endsWith('/') && !statSync(target).isDirectory()) {
      fail('path-mention', `${relPath} treats file \`${token}\` as a directory`);
    }
  }
}

// ------------------------------------------------------- 4. relative Markdown links

const LINK = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
for (const relPath of markdownFiles) {
  const { prose } = loadMarkdown(relPath);
  for (const match of prose.matchAll(LINK)) {
    const target = match[1];
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(target)) continue; // external or same-page anchor
    const [pathPart] = target.split('#');
    if (pathPart === '') continue;
    const resolved = resolve(ROOT, dirname(relPath), decodeURIComponent(pathPart));
    if (!resolved.startsWith(ROOT + sep) && resolved !== ROOT) {
      fail('link', `${relPath} links outside the repository: ${target}`);
    } else if (!existsSync(resolved)) {
      fail('link', `${relPath} links missing target: ${target}`);
    }
  }
}

// ------------------------------------------------------- 5. retired path prefix

for (const relPath of markdownFiles) {
  const { raw } = loadMarkdown(relPath);
  for (const bad of ['babylite/quickref/', 'babylite/raw-doc/']) {
    if (raw.includes(bad)) {
      fail('stale-prefix', `${relPath} still uses the retired ${bad} prefix`);
    }
  }
}

// --------------------------------------------------- 6. snapshot date consistency

const snapshot = /^\s*docs-snapshot:[ \t]*"?([0-9]{4}-[0-9]{2}-[0-9]{2})"?[ \t]*$/m.exec(skill.raw)?.[1];
if (snapshot === undefined) {
  fail('snapshot-date', 'SKILL.md metadata.docs-snapshot is missing or not YYYY-MM-DD');
} else if (!loadMarkdown('references/README.md').raw.includes(snapshot)) {
  fail('snapshot-date', `references/README.md does not mention the snapshot date ${snapshot}`);
}

// ---------------------------------------- 7. published package / skill consistency

// The published tarball is a second view of the same bundle, so a mismatch here
// means an installed `@andares/babylite` ships something different from what the
// repo verifies. `metadata.version` in SKILL.md is kept equal to package.json by
// the release script; enforcing it here catches a hand-edited bump.
const pkgPath = join(ROOT, 'package.json');
if (!existsSync(pkgPath)) {
  fail('package', 'package.json is missing');
} else {
  let pkg;
  try {
    pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  } catch (error) {
    fail('package', `package.json is not valid JSON: ${error.message}`);
  }
  if (pkg !== undefined) {
    if (pkg.name !== '@andares/babylite') {
      fail('package', `package name is ${JSON.stringify(pkg.name)}, expected "@andares/babylite"`);
    }
    if (!/^\d+\.\d+\.\d+$/.test(pkg.version ?? '')) {
      fail('package', `package version is not X.Y.Z: ${JSON.stringify(pkg.version)}`);
    }
    const skillVersion = /^\s*version:[ \t]*"?([^"\s]+)"?[ \t]*$/m.exec(skill.raw)?.[1];
    if (skillVersion !== pkg.version) {
      fail(
        'package',
        `SKILL.md metadata.version (${skillVersion ?? 'missing'}) != package.json version (${pkg.version})`,
      );
    }
    if (pkg.license !== 'MIT' || !existsSync(join(ROOT, 'LICENSE'))) {
      fail('package', 'license must be MIT and LICENSE must exist');
    }
    for (const field of ['description', 'repository']) {
      if (pkg[field] === undefined) fail('package', `package.json is missing \`${field}\``);
    }
    // Every shipped path must exist, and the bundle must actually be shipped.
    for (const entry of pkg.files ?? []) {
      if (!existsSync(join(ROOT, entry))) {
        fail('package', `package.json "files" lists missing path: ${entry}`);
      }
    }
    for (const required of ['SKILL.md', 'references']) {
      if (!(pkg.files ?? []).includes(required)) {
        fail('package', `package.json "files" must include ${required}`);
      }
    }
    for (const [name, target] of Object.entries(pkg.bin ?? {})) {
      const binPath = join(ROOT, target);
      if (!existsSync(binPath)) fail('package', `bin "${name}" points at missing ${target}`);
      else if ((statSync(binPath).mode & 0o111) === 0) {
        fail('package', `bin "${name}" (${target}) is not executable`);
      }
    }
    // pnpm-only toolchain: the pinned manager and its lockfile must both be
    // present, so a stray npm install cannot reintroduce a second lockfile.
    if (!/^pnpm@\d+\.\d+\.\d+$/.test(pkg.packageManager ?? '')) {
      fail('package', `packageManager must pin pnpm, got ${JSON.stringify(pkg.packageManager)}`);
    }
    if (!existsSync(join(ROOT, 'pnpm-lock.yaml'))) {
      fail('package', 'pnpm-lock.yaml is missing (run `pnpm install`)');
    }
    if (existsSync(join(ROOT, 'package-lock.json')) || existsSync(join(ROOT, 'yarn.lock'))) {
      fail('package', 'a foreign lockfile (package-lock.json / yarn.lock) is present');
    }
  }
}

// ---------------------------------------------------------------------- report

if (failures.length > 0) {
  console.error(`verify-docs: ${failures.length} failure(s)\n`);
  for (const line of failures) console.error(`  - ${line}`);
  process.exit(1);
}
console.log(
  `verify-docs: OK — ${markdownFiles.length} markdown files, all references resolve, package consistent.`,
);
