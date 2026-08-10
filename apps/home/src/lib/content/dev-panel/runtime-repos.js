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

const publicSiteSurfaces = [
    makeRepo({
        name: "penguinmod.github.io",
        why: "Main upstream route shell that combines the editor, player, and other public web surfaces.",
        devcorePath: "apps/editor",
    }),
    makeRepo({
        name: "PenguinMod-HomeNew",
        why: "Current Svelte homepage and account-facing web app for penguinmod.com.",
        devcorePath: "apps/home",
    }),
    makeRepo({
        name: "PenguinMod-Home",
        why: "Legacy homepage app still carries redirects, policy pages, and compatibility behavior not fully replaced in the rewrite.",
        devcorePath: "apps/home-legacy",
    }),
    makeRepo({
        name: "PenguinMod-Packager",
        why: "Owns the /packager surface required for menu parity and publishing flows.",
        devcorePath: "apps/packager",
    }),
    makeRepo({
        name: "PenguinMod-Docs",
        why: "Owns the docs/help surface linked from the public site and editor ecosystem.",
        devcorePath: "apps/docs",
    }),
    makeRepo({
        name: "PenguinMod-ExtensionsGallery",
        why: "Owns the extensions gallery surface and public extension discovery flow.",
        devcorePath: "apps/extensions-gallery",
    }),
    makeRepo({
        name: "PenguinMod-Holdover",
        why: "Fallback site experience used when the main site is degraded or partially unavailable.",
        devcorePath: "apps/holdover",
    }),
];

const ownedServices = [
    makeRepo({
        name: "PenguinMod-BackendApi",
        why: "Primary backend for accounts, projects, profile pages, my stuff, feeds, and featured/frontpage data.",
        devcorePath: "services/backend-api",
    }),
    makeRepo({
        name: "PenguinMod-BasicApi",
        why: "Provides the homepage support cards such as What's New and status-style update data.",
        devcorePath: "services/basic-api",
    }),
    makeRepo({
        name: "PenguinMod-StorageExtAPI",
        why: "Backs the storage extension API used by projects at runtime.",
        devcorePath: "services/storage-ext-api",
    }),
];

const editorRuntimePackages = [
    makeRepo({
        name: "PenguinMod-Storage",
        why: "Project and asset storage package used throughout the editor/runtime stack.",
        devcorePath: "packages/storage",
    }),
    makeRepo({
        name: "PenguinMod-Vm",
        why: "Core VM for project execution, custom blocks, extensions, and player behavior.",
        devcorePath: "packages/vm",
    }),
    makeRepo({
        name: "PenguinMod-Blocks",
        why: "Block definitions and block-rendering behavior required by the editor.",
        devcorePath: "packages/blocks",
    }),
    makeRepo({
        name: "PenguinMod-Render",
        why: "Renderer used by the runtime and player surfaces.",
        devcorePath: "packages/render",
    }),
    makeRepo({
        name: "PenguinMod-Audio",
        why: "Audio engine used by project playback and editing tools.",
        devcorePath: "packages/audio",
    }),
    makeRepo({
        name: "PenguinMod-Paint",
        why: "Costume editor surface used from the main editor.",
        devcorePath: "packages/paint",
    }),
    makeRepo({
        name: "PenguinMod-Parser",
        why: "Project parsing support used during load/import flows.",
        devcorePath: "packages/parser",
    }),
    makeRepo({
        name: "penguinmod-svg-renderer",
        why: "SVG rendering dependency used by the runtime/editor toolchain.",
        devcorePath: "packages/svg-renderer",
    }),
    makeRepo({
        name: "penguinmod-render-fonts",
        why: "Font assets required by renderer output and text fidelity.",
        devcorePath: "packages/render-fonts",
    }),
    makeRepo({
        name: "PenguinMod-ObjectLibraries",
        why: "Backs built-in costumes, sounds, and other object-library content.",
        devcorePath: "packages/object-libraries",
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

const sharedUiAndContentPackages = [
    makeRepo({
        name: "PenguinMod-SvelteUI",
        why: "Shared UI library used across the home-side surfaces.",
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
];

const criticalPath = [
    ...publicSiteSurfaces,
    ...ownedServices,
    ...editorRuntimePackages,
    ...sharedUiAndContentPackages,
];

const phaseTwo = [
    makeRepo({
        name: "PenguinMod-GenericExtApi",
        why: "Extension-serving API worth folding in once the owned backend path is stable.",
        devcorePath: "packages/generic-ext-api",
    }),
    makeRepo({
        name: "PenguinMod-ApiModule",
        why: "Internal helper module that reduces glue code while the services are being unified.",
        devcorePath: "packages/api-module",
    }),
    makeRepo({
        name: "PenguinMod-Addons",
        why: "Addon surface for later parity with the wider PenguinMod ecosystem.",
        devcorePath: "apps/addons",
    }),
    makeRepo({
        name: "PenguinMod-LibraryConcileUI",
        why: "Useful for internal library metadata workflows, but not blocking the public clone.",
        devcorePath: "apps/library-concile",
    }),
    makeRepo({
        name: "PenguinMod-Guidelines",
        why: "Needed for full policy/admin parity and better in-app moderation tooling.",
        devcorePath: "tools/guidelines",
    }),
    makeRepo({
        name: "PenguinMod-Scripts",
        why: "Build and maintenance helpers that support migration work rather than public runtime.",
        devcorePath: "tools/scripts",
    }),
    makeRepo({
        name: "PenguinBot-Public",
        why: "Community automation tooling, useful later for moderation and community workflows.",
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

const requiredByRole = [
    {
        id: "public-site-surfaces",
        title: "Public Site Surfaces",
        description: "These repos own the visible routes and menu surfaces a user expects on penguinmod.com.",
        repos: publicSiteSurfaces,
    },
    {
        id: "owned-services",
        title: "Owned Services",
        description: "These repos are what turn the web shell into a real product with accounts, projects, feeds, and extension storage.",
        repos: ownedServices,
    },
    {
        id: "editor-runtime-packages",
        title: "Editor / Runtime Packages",
        description: "These repos are the code and assets the editor, player, packager, and libraries actually execute with.",
        repos: editorRuntimePackages,
    },
    {
        id: "shared-ui-and-content-packages",
        title: "Shared UI / Content Packages",
        description: "These repos support the modern Svelte home-side surfaces and shared rendering behavior.",
        repos: sharedUiAndContentPackages,
    },
];

const allReviewedRepos = [...criticalPath, ...phaseTwo, ...archivedOrExcluded];
const targetCloneRepos = [...criticalPath, ...phaseTwo];
const importedIntoRepo = targetCloneRepos.filter(repo => Boolean(repo.devcorePath));
const missingFromRepo = targetCloneRepos.filter(repo => !repo.devcorePath);

const runtimeRepos = {
    reviewDate: "2026-08-10",
    reviewedRepoCount: allReviewedRepos.length,
    goal: "Collapse the public PenguinMod stack needed for penguinmod.com into one DevCore monorepo and one Vercel project.",
    source: "https://api.github.com/orgs/PenguinMod/repos?per_page=100&type=public",
    currentOrgSnapshot: {
        publicRepoCount: 45,
        activeRepoCount: 36,
        archivedRepoCount: 9,
        forkedRepoCount: 18,
        nonForkRepoCount: 27,
    },
    selectionPrinciples: [
        "A repo is critical if removing it would break a user-visible penguinmod.com surface or the runtime/editor stack behind that surface.",
        "Backends stay in the required set when the current DevCore shell still depends on upstream-owned account, project, feed, or storage behavior.",
        "Archived repos stay reviewed for migration context, but do not count toward the required runtime unless the live site still depends on them.",
    ],
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
                label: "Unified static site shell",
                source: "dist/vercel contains the main home app plus /credits, /profile, /mystuff, /support, /settings, /privacy, /terms, /guidelines, and /dev-panel.",
            },
            {
                label: "Editor and player rebuilt from source",
                source: "scripts/build-vercel-output.mjs emitted fresh dist/vercel/editor assets on 2026-08-09 around 20:59 local time.",
            },
            {
                label: "Packager rebuilt from source",
                source: "scripts/build-vercel-output.mjs emitted fresh dist/vercel/packager assets on 2026-08-09 around 20:59 local time.",
            },
            {
                label: "Docs",
                source: "dist/vercel/docs is produced from apps/docs during the unified build.",
            },
            {
                label: "Extensions gallery",
                source: "dist/vercel/extensions-gallery and dist/vercel/extensions are produced during the unified build.",
            },
            {
                label: "DevCore homepage styling and dev panel",
                source: "apps/home owns the green branded homepage shell and /dev-panel route now served from the same project.",
            },
            {
                label: "Owned credits route",
                source: "apps/home/src/routes/credits/+page.svelte now owns the public credits surface and reuses imported contributor data from the editor-side credits source.",
            },
            {
                label: "Owned contact route",
                source: "apps/home/src/routes/contact/+page.svelte now owns the public contact surface, and shared site links point /contact into the unified home app instead of the editor bundle.",
            },
            {
                label: "Owned homepage support feed",
                source: "scripts/build-vercel-output.mjs now publishes /basic-api/status, /basic-api/updates, and /basic-api/commits from a checked-in DevCore content module, and the homepage renders the owned /basic-api/status alert banner.",
            },
            {
                label: "Owned homepage project rails mirror",
                source: "scripts/build-vercel-output.mjs now publishes /api/v1/projects/frontpage from a checked-in DevCore frontpage snapshot.",
            },
            {
                label: "Owned public profile snapshot route",
                source: "scripts/build-vercel-output.mjs now publishes /api/v1/devcore/profiles/*.json from the mirrored homepage catalog, and /profile reads from that owned data for cataloged creators.",
            },
            {
                label: "Owned read-only My Stuff workspace",
                source: "apps/home/src/routes/mystuff/+page.svelte now reads the owned public profile catalog so the navigation lands on a real mirrored project workspace instead of a handoff page.",
            },
            {
                label: "Owned settings surface",
                source: "apps/home/src/routes/settings/+page.svelte now owns theme, language, local cache controls, and account snapshot UI inside the unified home app instead of handing users to an upstream placeholder.",
            },
            {
                label: "Local draftable homepage control plane",
                source: "apps/home/src/routes/dev-panel/+page.svelte now saves browser-local drafts for homepage rails, What's New, status payloads, and DevCore News, and the owned home app preview path consumes those overrides.",
            },
        ],
        highestLeverageGaps: [
            {
                name: "Owned account and project backend inside one deployment",
                why: "services/backend-api is imported, and the unified deployment now owns homepage rails, a local settings surface, read-only public profiles, and a read-only My Stuff workspace, but it still depends on upstream PenguinMod services for login, writable profiles, writable project management, project detail, and writable homepage curation behavior.",
            },
            {
                name: "Owned storage extension API",
                why: "services/storage-ext-api is imported locally, but not yet wired into the unified deployment path, so storage-extension behavior is not DevCore-owned end to end.",
            },
            {
                name: "Automatic holdover failover",
                why: "apps/holdover is copied in, but the unified app does not yet swap to it automatically during outage scenarios.",
            },
            {
                name: "Authenticated persisted admin control plane",
                why: "/dev-panel can now draft and preview homepage rails, updates, status, and DevCore News locally in-browser, but those edits are not yet authenticated, shared across staff, or persisted by the owned backend.",
            },
        ],
    },
    requiredByRole,
    missingFromRepo,
    criticalPath,
    phaseTwo,
    archivedOrExcluded,
};

export default runtimeRepos;
