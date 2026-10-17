# Changelog

Release history for `@andares/babylite`, newest first. `pnpm release <bump>`
prepends the section for each release — the commit subjects since the previous
tag — so this file and the GitHub Release always cover the same range.

## [1.1.2] - 2026-10-17

- Drop the release gates: the prohibition is a rule, not a lock
- Take Release notes from the changelog instead of GitHub's generator

## [1.1.1] - 2026-10-17

- Explain which permission a rejected token is missing

## [1.1.0] - 2026-10-17

- Record every release in CHANGELOG.md
- Repair a missing GitHub Release, and fail before a version is stranded
- Record the README, symlink and freshness rules in AGENTS.md
- Ship an English README by default, with the Chinese copy beside it
- Point at the official docs when the local snapshot is stale
- Refuse to install through a symlinked target
- Document the npx failure when run inside this repository
- Rewrite the install section around the shared .agents/skills directory
- Make the human-only push rule explicit
- Reserve releases for the repository owner

## [1.0.1] - 2026-09-14

- Initial release: offline snapshot of the Babylon Lite docs, the effect index
  (effect → API → topic), and the `babylite` installer CLI.
