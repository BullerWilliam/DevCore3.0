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

This repo is arranged for a root-based Vercel monorepo workflow:

- Root `vercel.json`: default home deployment
- Additional Vercel projects should keep the repo root and override only the build/output settings in the dashboard

Suggested project settings:

- Home: `npm run build:home` with output `apps/home/build`
- Editor: `npm run build:editor` with output `apps/editor/build`
- Packager: `npm run build:packager` with output `apps/packager/dist`

## Repo Inventory

- `config/penguinmod-repos.json`: upstream PenguinMod repo inventory
- `config/repo-map.json`: where each imported repo now lives inside DevCore
