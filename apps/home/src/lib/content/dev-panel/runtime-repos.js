const runtimeRepos = {
    reviewedRepoCount: 45,
    reviewDate: "2026-08-09",
    goal: "Collapse the public PenguinMod stack needed for penguinmod.com into one DevCore monorepo and one Vercel project.",
    criticalPath: [
        {
            name: "penguinmod.github.io",
            why: "Main editor shell and route structure that currently combines the upstream editor surfaces."
        },
        {
            name: "PenguinMod-HomeNew",
            why: "Current Svelte home app base for the main penguinmod.com experience."
        },
        {
            name: "PenguinMod-Home",
            why: "Legacy home app still contains behavior and content patterns not fully moved into the rewrite."
        },
        {
            name: "PenguinMod-Packager",
            why: "Owns the /packager surface that the target DevCore clone also needs."
        },
        {
            name: "PenguinMod-Docs",
            why: "Owns docs/help surfaces linked from the main site and needed for menu parity."
        },
        {
            name: "PenguinMod-ExtensionsGallery",
            why: "Owns the extensions gallery surface used by the editor ecosystem."
        },
        {
            name: "PenguinMod-Holdover",
            why: "Fallback/holdover surface for outages and migration gaps."
        },
        {
            name: "PenguinMod-BackendApi",
            why: "Main account, project, and frontpage/project-sharing backend needed for home, profile, my stuff, and project data."
        },
        {
            name: "PenguinMod-BasicApi",
            why: "Feeds the home page cards such as What's New and status-style content."
        },
        {
            name: "PenguinMod-StorageExtAPI",
            why: "Needed for the storage extension ecosystem used by projects in the editor runtime."
        },
        {
            name: "PenguinMod-Storage",
            why: "Project and asset storage package used by the runtime stack."
        },
        {
            name: "PenguinMod-Vm",
            why: "Core VM for the editor/player runtime."
        },
        {
            name: "PenguinMod-Blocks",
            why: "Core block definitions and block rendering behavior."
        },
        {
            name: "PenguinMod-Render",
            why: "Renderer used by the runtime and player."
        },
        {
            name: "PenguinMod-Audio",
            why: "Audio engine for editor/runtime behavior."
        },
        {
            name: "PenguinMod-Paint",
            why: "Costume editor surface used from the main editor."
        },
        {
            name: "PenguinMod-Parser",
            why: "Project parsing support for the runtime stack."
        },
        {
            name: "penguinmod-svg-renderer",
            why: "SVG rendering dependency used by the runtime/editor toolchain."
        },
        {
            name: "penguinmod-render-fonts",
            why: "Font assets required by rendering."
        },
        {
            name: "PenguinMod-ObjectLibraries",
            why: "Backs built-in costumes, sounds, and library content."
        },
        {
            name: "PenguinMod-SvelteUI",
            why: "Shared UI library already used across the home-side surfaces."
        },
        {
            name: "PenguinMod-MarkDownNew",
            why: "Modern markdown helpers for home/news/docs rendering."
        },
        {
            name: "pmp-protobuf",
            why: "Shared protocol/runtime utility used by the modern PenguinMod stack."
        },
        {
            name: "PenguinMod-Paper",
            why: "Vector editing dependency used by paint/editor flows."
        },
        {
            name: "BFunEmoji",
            why: "Emoji asset package referenced by the editor/runtime ecosystem."
        }
    ],
    phaseTwo: [
        {
            name: "PenguinMod-GenericExtApi",
            why: "Extension-serving API that should be folded in once the main site/editor stack is stable."
        },
        {
            name: "PenguinMod-ApiModule",
            why: "Internal helper module for wiring DevCore services together during the migration."
        },
        {
            name: "PenguinMod-Addons",
            why: "Addon surface for later parity with the wider PenguinMod ecosystem."
        },
        {
            name: "PenguinMod-LibraryConcileUI",
            why: "Useful for internal library metadata workflows, but not blocking the public site clone."
        },
        {
            name: "PenguinMod-Guidelines",
            why: "Needed for full policy/guidelines parity and admin workflow, but not blocking the first unified runtime."
        },
        {
            name: "PenguinMod-Scripts",
            why: "Build and maintenance helpers that support migration work rather than public runtime."
        },
        {
            name: "PenguinBot-Public",
            why: "Community automation tooling, useful later for moderation/community features."
        },
        {
            name: "PenguinMod-VSCode-Extension",
            why: "Developer tooling, not required for the live DevCore site itself."
        },
        {
            name: "PenguinMod-Desktop-OLD-CAT-VERSION",
            why: "Desktop/offline app work that can be folded in after the web platform is stable."
        },
        {
            name: "PenguinMod-MarkDown",
            why: "Older markdown package kept for compatibility review while the newer wrapper leads the migration."
        },
        {
            name: "PenguinMod-Gui",
            why: "Legacy static editor wrapper worth mining for redirects and compatibility behavior, but not the primary source of truth."
        }
    ],
    archivedOrExcluded: [
        {
            name: "FreshPkg",
            why: "Archived and not part of the current public site path."
        },
        {
            name: "PenguinMod-DocsLegacy",
            why: "Archived docs generation path superseded by newer docs repos."
        },
        {
            name: "PenguinMod-DocsNew",
            why: "Archived intermediate docs rewrite superseded by PenguinMod-Docs."
        },
        {
            name: "penguinmod-download-page",
            why: "Archived offline-version download microsite, not required for the main unified Vercel app."
        },
        {
            name: "PenguinMod-IntermediateBackendApi",
            why: "Archived backend iteration replaced by the current backend stack."
        },
        {
            name: "PenguinMod-LegacyBackendApi",
            why: "Archived backend iteration replaced by newer services."
        },
        {
            name: "PenguinMod-StorageOld",
            why: "Archived storage fork replaced by the current storage package."
        },
        {
            name: "PenguinMod-WRONG-REPOSITORY-Desktop",
            why: "Archived TurboWarp desktop fork placeholder, not part of the current web stack."
        },
        {
            name: "PMSharing-template",
            why: "Archived template/example repo, not production runtime."
        }
    ]
};

export default runtimeRepos;
