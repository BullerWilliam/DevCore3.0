const repoUrl = name => `https://github.com/PenguinMod/${name}`;

const makeRepo = ({
    name,
    why,
    devcorePath = null,
}) => ({
    name,
    repoUrl: repoUrl(name),
    why,
    devcorePath,
});

const criticalPath = [
    makeRepo({
        name: "penguinmod.github.io",
        why: "Main editor shell and route structure that currently combines the upstream editor surfaces.",
        devcorePath: "apps/editor",
    }),
    makeRepo({
        name: "PenguinMod-HomeNew",
        why: "Current Svelte home app base for the main penguinmod.com experience.",
        devcorePath: "apps/home",
    }),
    makeRepo({
        name: "PenguinMod-Home",
        why: "Legacy home app still contains behavior and content patterns not fully moved into the rewrite.",
        devcorePath: "apps/home-legacy",
    }),
    makeRepo({
        name: "PenguinMod-Packager",
        why: "Owns the /packager surface that the target DevCore clone also needs.",
        devcorePath: "apps/packager",
    }),
    makeRepo({
        name: "PenguinMod-Docs",
        why: "Owns docs/help surfaces linked from the main site and needed for menu parity.",
        devcorePath: "apps/docs",
    }),
    makeRepo({
        name: "PenguinMod-ExtensionsGallery",
        why: "Owns the extensions gallery surface used by the editor ecosystem.",
        devcorePath: "apps/extensions-gallery",
    }),
    makeRepo({
        name: "PenguinMod-Holdover",
        why: "Fallback/holdover surface for outages and migration gaps.",
        devcorePath: "apps/holdover",
    }),
    makeRepo({
        name: "PenguinMod-BackendApi",
        why: "Main account, project, and frontpage/project-sharing backend needed for home, profile, my stuff, and project data.",
        devcorePath: "services/backend-api",
    }),
    makeRepo({
        name: "PenguinMod-BasicApi",
        why: "Feeds the home page cards such as What's New and status-style content.",
        devcorePath: "services/basic-api",
    }),
    makeRepo({
        name: "PenguinMod-StorageExtAPI",
        why: "Needed for the storage extension ecosystem used by projects in the editor runtime.",
        devcorePath: "services/storage-ext-api",
    }),
    makeRepo({
        name: "PenguinMod-Storage",
        why: "Project and asset storage package used by the runtime stack.",
        devcorePath: "packages/storage",
    }),
    makeRepo({
        name: "PenguinMod-Vm",
        why: "Core VM for the editor/player runtime.",
        devcorePath: "packages/vm",
    }),
    makeRepo({
        name: "PenguinMod-Blocks",
        why: "Core block definitions and block rendering behavior.",
        devcorePath: "packages/blocks",
    }),
    makeRepo({
        name: "PenguinMod-Render",
        why: "Renderer used by the runtime and player.",
        devcorePath: "packages/render",
    }),
    makeRepo({
        name: "PenguinMod-Audio",
        why: "Audio engine for editor/runtime behavior.",
        devcorePath: "packages/audio",
    }),
    makeRepo({
        name: "PenguinMod-Paint",
        why: "Costume editor surface used from the main editor.",
        devcorePath: "packages/paint",
    }),
    makeRepo({
        name: "PenguinMod-Parser",
        why: "Project parsing support for the runtime stack.",
        devcorePath: "packages/parser",
    }),
    makeRepo({
        name: "penguinmod-svg-renderer",
        why: "SVG rendering dependency used by the runtime/editor toolchain.",
        devcorePath: "packages/svg-renderer",
    }),
    makeRepo({
        name: "penguinmod-render-fonts",
        why: "Font assets required by rendering.",
        devcorePath: "packages/render-fonts",
    }),
    makeRepo({
        name: "PenguinMod-ObjectLibraries",
        why: "Backs built-in costumes, sounds, and library content.",
        devcorePath: "packages/object-libraries",
    }),
    makeRepo({
        name: "PenguinMod-SvelteUI",
        why: "Shared UI library already used across the home-side surfaces.",
        devcorePath: "packages/svelte-ui",
    }),
    makeRepo({
        name: "PenguinMod-MarkDownNew",
        why: "Modern markdown helpers for home/news/docs rendering.",
        devcorePath: "packages/markdown-new",
    }),
    makeRepo({
        name: "pmp-protobuf",
        why: "Shared protocol/runtime utility used by the modern PenguinMod stack.",
        devcorePath: "packages/pmp-protobuf",
    }),
    makeRepo({
        name: "PenguinMod-Paper",
        why: "Vector editing dependency used by paint/editor flows.",
        devcorePath: "packages/paper",
    }),
    makeRepo({
        name: "BFunEmoji",
        why: "Emoji asset package referenced by the editor/runtime ecosystem.",
        devcorePath: "packages/bfunemoji",
    }),
];

const phaseTwo = [
    makeRepo({
        name: "PenguinMod-GenericExtApi",
        why: "Extension-serving API that should be folded in once the main site/editor stack is stable.",
        devcorePath: "packages/generic-ext-api",
    }),
    makeRepo({
        name: "PenguinMod-ApiModule",
        why: "Internal helper module for wiring DevCore services together during the migration.",
        devcorePath: "packages/api-module",
    }),
    makeRepo({
        name: "PenguinMod-Addons",
        why: "Addon surface for later parity with the wider PenguinMod ecosystem.",
        devcorePath: "apps/addons",
    }),
    makeRepo({
        name: "PenguinMod-LibraryConcileUI",
        why: "Useful for internal library metadata workflows, but not blocking the public site clone.",
        devcorePath: "apps/library-concile",
    }),
    makeRepo({
        name: "PenguinMod-Guidelines",
        why: "Needed for full policy/guidelines parity and admin workflow, but not blocking the first unified runtime.",
        devcorePath: "tools/guidelines",
    }),
    makeRepo({
        name: "PenguinMod-Scripts",
        why: "Build and maintenance helpers that support migration work rather than public runtime.",
        devcorePath: "tools/scripts",
    }),
    makeRepo({
        name: "PenguinBot-Public",
        why: "Community automation tooling, useful later for moderation/community features.",
        devcorePath: "tools/penguinbot-public",
    }),
    makeRepo({
        name: "PenguinMod-VSCode-Extension",
        why: "Developer tooling, not required for the live DevCore site itself.",
        devcorePath: "tools/vscode-extension",
    }),
    makeRepo({
        name: "PenguinMod-Desktop-OLD-CAT-VERSION",
        why: "Desktop/offline app work that can be folded in after the web platform is stable.",
        devcorePath: "apps/desktop-old-cat-version",
    }),
    makeRepo({
        name: "PenguinMod-MarkDown",
        why: "Older markdown package kept for compatibility review while the newer wrapper leads the migration.",
        devcorePath: "packages/markdown",
    }),
    makeRepo({
        name: "PenguinMod-Gui",
        why: "Legacy static editor wrapper worth mining for redirects and compatibility behavior, but not the primary source of truth.",
    }),
];

const archivedOrExcluded = [
    makeRepo({
        name: "FreshPkg",
        why: "Archived and not part of the current public site path.",
    }),
    makeRepo({
        name: "PenguinMod-DocsLegacy",
        why: "Archived docs generation path superseded by newer docs repos.",
    }),
    makeRepo({
        name: "PenguinMod-DocsNew",
        why: "Archived intermediate docs rewrite superseded by PenguinMod-Docs.",
    }),
    makeRepo({
        name: "penguinmod-download-page",
        why: "Archived offline-version download microsite, not required for the main unified Vercel app.",
    }),
    makeRepo({
        name: "PenguinMod-IntermediateBackendApi",
        why: "Archived backend iteration replaced by the current backend stack.",
    }),
    makeRepo({
        name: "PenguinMod-LegacyBackendApi",
        why: "Archived backend iteration replaced by newer services.",
    }),
    makeRepo({
        name: "PenguinMod-StorageOld",
        why: "Archived storage fork replaced by the current storage package.",
    }),
    makeRepo({
        name: "PenguinMod-WRONG-REPOSITORY-Desktop",
        why: "Archived TurboWarp desktop fork placeholder, not part of the current web stack.",
    }),
    makeRepo({
        name: "PMSharing-template",
        why: "Archived template/example repo, not production runtime.",
    }),
];

const allReviewedRepos = [...criticalPath, ...phaseTwo, ...archivedOrExcluded];
const targetCloneRepos = [...criticalPath, ...phaseTwo];
const importedIntoRepo = targetCloneRepos.filter(repo => Boolean(repo.devcorePath));
const missingFromRepo = targetCloneRepos.filter(repo => !repo.devcorePath);

const runtimeRepos = {
    reviewDate: "2026-08-09",
    reviewedRepoCount: allReviewedRepos.length,
    goal: "Collapse the public PenguinMod stack needed for penguinmod.com into one DevCore monorepo and one Vercel project.",
    source: "https://api.github.com/orgs/PenguinMod/repos?per_page=100&type=public",
    auditSummary: {
        reviewedRepoCount: allReviewedRepos.length,
        targetCloneRepoCount: targetCloneRepos.length,
        importedIntoRepoCount: importedIntoRepo.length,
        criticalImportedCount: criticalPath.filter(repo => Boolean(repo.devcorePath)).length,
        missingFromRepoCount: missingFromRepo.length,
    },
    currentVercelCoverage: {
        liveNow: [
            {
                label: "Homepage shell and account pages",
                source: "apps/home built by scripts/build-vercel-output.mjs",
            },
            {
                label: "Editor and player",
                source: "apps/home/vercel-output/editor and player checked into the repo",
            },
            {
                label: "Packager",
                source: "apps/home/vercel-output/packager checked into the repo",
            },
            {
                label: "Uploading guidelines route",
                source: "apps/home/public/guidelines plus Vercel rewrite entries",
            },
            {
                label: "Dev Panel",
                source: "apps/home/src/routes/dev-panel/+page.svelte",
            },
        ],
        highestLeverageGaps: [
            {
                name: "PenguinMod-Docs",
                why: "Imported at apps/docs, but scripts/build-vercel-output.mjs does not publish a docs route yet.",
            },
            {
                name: "PenguinMod-ExtensionsGallery",
                why: "Imported at apps/extensions-gallery, but the current Vercel output does not expose an extensions gallery surface yet.",
            },
            {
                name: "PenguinMod-Holdover",
                why: "Imported at apps/holdover, but the current Vercel build does not swap to it automatically for outages.",
            },
            {
                name: "PenguinMod-BackendApi",
                why: "Copied into services/backend-api, but account/project APIs are not yet running inside the unified Vercel deployment path.",
            },
            {
                name: "PenguinMod-BasicApi",
                why: "Copied into services/basic-api, but the homepage still mirrors upstream update data instead of a DevCore-owned service.",
            },
            {
                name: "PenguinMod-StorageExtAPI",
                why: "Copied into services/storage-ext-api, but it is not yet part of the current single-project deployment.",
            },
            {
                name: "PenguinMod-Gui",
                why: "This is the only active phase-two repo not yet copied into the DevCore monorepo.",
            },
        ],
    },
    missingFromRepo,
    criticalPath,
    phaseTwo,
    archivedOrExcluded,
};

export default runtimeRepos;
