# DevCore

DevCore is a combined PenguinMod monorepo organized for Vercel and local multi-app development. The original Scratch fork that lived in this repo has been replaced with a structured import of the PenguinMod ecosystem so the core surfaces can evolve under one repository:

- `apps/home`: the main DevCore home site based on `PenguinMod-HomeNew`
- `apps/editor`: the main editor based on `penguinmod.github.io`
- `apps/packager`: the packager app
- `apps/addons`: the addon source tree
- `services/*`: backend and sharing-related services
- `packages/*`: runtime packages such as VM, render, storage, parser, paint, and shared utilities
- `archive/*`: legacy or superseded repos that were still pulled in for reference

## Theme Sync

DevCore adds a shared theme contract through `packages/devcore-theme`. The home site exposes the color controls, and the selected top-bar colors are stored in `localStorage` under `devcore:theme` so the home, editor, and packager surfaces can stay visually aligned when served from the same Vercel origin or path-based setup.

## Vercel

This repo is arranged for a root-based Vercel workflow that assembles multiple DevCore surfaces into one static deployment:

- Root `vercel.json`: installs the repo without running legacy package scripts, then calls `npm run build:vercel`
- `scripts/build-vercel-output.mjs`: performs app-local installs for `apps/home` and `apps/editor`, builds home/editor/packager, and assembles the combined output into `dist/vercel`
- Default output directory: `dist/vercel`
- Node runtime: controlled by `package.json` `engines.node`, currently `24.x`
- Function runtime config: intentionally no legacy `version`, `builds`, or `functions.runtime` block in `vercel.json`
- Home env vars can be copied from `apps/home/.env.template`, but the repo includes safe runtime defaults so the home build does not fail when those vars are absent

Suggested project settings:

- Build command: `npm run build:vercel`
- Output directory: `dist/vercel`
- If Vercel reports `Function Runtimes must have a valid version`, clear any Dashboard function runtime override and redeploy once without build cache so Vercel stops using stale runtime config
- Main routes after build:
  - `/` for home
  - `/editor` for the editor
  - `/player` for shared-project playback
  - `/packager` for the packager

Current build status:

- Home: builds successfully
- Packager: builds successfully
- Editor: builds successfully through the upstream PenguinMod prebuilt package set, while the imported local source repos remain in-tree for DevCore development

## Repo Inventory

- `config/penguinmod-repos.json`: upstream PenguinMod repo inventory
- `config/repo-map.json`: where each imported repo now lives inside DevCore
