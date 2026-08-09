<script>
    import { onMount } from "svelte";

    import homepageNews from "$lib/content/dev-panel/homepage-news";
    import runtimeRepos from "$lib/content/dev-panel/runtime-repos";
    import PenguinModBasicAPI from "$lib/resources/penguinmod/basic-api";
    import PenguinModClient from "$lib/resources/penguinmod/client";
    import Locale from "$lib/resources/localization/locale";
    import { buildSharedProjectPath } from "$lib/resources/site-paths";

    const contentSources = [
        {
            label: "Featured / voted / latest project rails",
            source: "PenguinMod-BackendApi frontpage project endpoints",
            status: "Live mirror shown below",
            next: "Move featured and homepage curation into a DevCore-owned admin backend."
        },
        {
            label: "What's New block",
            source: "PenguinMod-BasicApi updates feed",
            status: "Live mirror shown below",
            next: "Replace with a DevCore-owned updates store once the backend is unified."
        },
        {
            label: "DevCore News block",
            source: "$lib/content/dev-panel/homepage-news.js",
            status: "Editable in-repo now",
            next: "Replace file-backed content with authenticated admin editing later."
        }
    ];

    const emptyFrontpage = {
        selectedTag: "",
        featured: [],
        voted: [],
        tagged: [],
        latest: [],
    };

    let frontpageLoading = $state(true);
    let frontpageError = $state(null);
    let frontpageData = $state(emptyFrontpage);

    let updatesLoading = $state(true);
    let updatesError = $state(null);
    let updatesData = $state([]);

    const homepageSections = $derived([
        {
            label: "Featured",
            items: frontpageData.featured,
        },
        {
            label: "Voted",
            items: frontpageData.voted,
        },
        {
            label: "Latest",
            items: frontpageData.latest,
        },
        {
            label: frontpageData.selectedTag
                ? `Tag: ${frontpageData.selectedTag}`
                : "Tagged",
            items: frontpageData.tagged,
        }
    ]);

    onMount(async () => {
        const [frontpageResult, updatesResult] = await Promise.allSettled([
            PenguinModClient.projects.getFrontPage(false),
            PenguinModBasicAPI.updates(),
        ]);

        if (frontpageResult.status === "fulfilled") {
            frontpageData = {
                ...emptyFrontpage,
                ...frontpageResult.value,
            };
        } else {
            console.error(frontpageResult.reason);
            frontpageError = frontpageResult.reason;
        }
        frontpageLoading = false;

        if (updatesResult.status === "fulfilled") {
            updatesData = updatesResult.value;
        } else {
            console.error(updatesResult.reason);
            updatesError = updatesResult.reason;
        }
        updatesLoading = false;
    });
</script>

<svelte:head>
    <title>DevCore Dev Panel</title>
</svelte:head>

<main class="panel-page">
    <section class="panel-card hero-card">
        <p class="eyebrow">DevCore</p>
        <h1>Dev Panel</h1>
        <p>
            This is the first migration control surface for the unified DevCore clone effort. It
            tracks which public PenguinMod repos are actually needed for the live stack, which of
            those repos are already copied into this monorepo, and where the homepage content is
            currently sourced from.
        </p>
        <p>
            Reviewed upstream repos: <strong>{runtimeRepos.auditSummary.reviewedRepoCount}</strong> as of
            <strong>{runtimeRepos.reviewDate}</strong>.
        </p>
    </section>

    <section class="panel-card">
        <h2>Repo Audit Snapshot</h2>
        <div class="overview-grid">
            <article class="mini-card">
                <h3>Repos Reviewed</h3>
                <p>{runtimeRepos.auditSummary.reviewedRepoCount}</p>
            </article>
            <article class="mini-card">
                <h3>Repos Needed For DevCore Clone</h3>
                <p>{runtimeRepos.auditSummary.targetCloneRepoCount}</p>
            </article>
            <article class="mini-card">
                <h3>Needed Repos Already Copied In</h3>
                <p>{runtimeRepos.auditSummary.importedIntoRepoCount}</p>
            </article>
            <article class="mini-card">
                <h3>Critical Repos Already Copied In</h3>
                <p>{runtimeRepos.auditSummary.criticalImportedCount} / {runtimeRepos.criticalPath.length}</p>
            </article>
            <article class="mini-card">
                <h3>Needed Repos Still Missing</h3>
                <p>{runtimeRepos.auditSummary.missingFromRepoCount}</p>
            </article>
        </div>
    </section>

    <section class="panel-card two-col">
        <div>
            <h2>Current Vercel Output Coverage</h2>
            <div class="stack">
                {#each runtimeRepos.currentVercelCoverage.liveNow as item}
                    <article class="mini-card">
                        <h3>{item.label}</h3>
                        <p>{item.source}</p>
                    </article>
                {/each}
            </div>
        </div>
        <div>
            <h2>Highest-Leverage Unified Runtime Gaps</h2>
            <div class="stack">
                {#each runtimeRepos.currentVercelCoverage.highestLeverageGaps as item}
                    <article class="mini-card muted-card">
                        <h3>{item.name}</h3>
                        <p>{item.why}</p>
                    </article>
                {/each}
            </div>
        </div>
    </section>

    <section class="panel-card">
        <h2>Homepage Content Sources</h2>
        <div class="stack">
            {#each contentSources as item}
                <article class="mini-card">
                    <h3>{item.label}</h3>
                    <p><strong>Current source:</strong> {item.source}</p>
                    <p><strong>Status:</strong> {item.status}</p>
                    <p><strong>Next step:</strong> {item.next}</p>
                </article>
            {/each}
        </div>
    </section>

    <section class="panel-card">
        <h2>Live Homepage Control Snapshot</h2>
        <div class="overview-grid">
            <article class="mini-card">
                <h3>Featured Projects</h3>
                <p>{frontpageData.featured.length}</p>
            </article>
            <article class="mini-card">
                <h3>Voted Projects</h3>
                <p>{frontpageData.voted.length}</p>
            </article>
            <article class="mini-card">
                <h3>Latest Projects</h3>
                <p>{frontpageData.latest.length}</p>
            </article>
            <article class="mini-card">
                <h3>Homepage Tag</h3>
                <p>{frontpageData.selectedTag || "None"}</p>
            </article>
        </div>
    </section>

    <section class="panel-card">
        <h2>Live What's New Block</h2>
        {#if updatesLoading}
            <p>Loading current updates feed...</p>
        {:else if updatesError}
            <p class="error-text">Failed to load the current updates feed.</p>
        {:else}
            <div class="stack">
                {#each updatesData as update}
                    <article class="mini-card">
                        <h3>{update.headline || "Untitled update"}</h3>
                        <p>{update.content || update.rawContent}</p>
                        <p>
                            <strong>Author:</strong>
                            {update.authorName || "Unknown"}
                        </p>
                        <p>
                            <strong>Timestamp:</strong>
                            {Locale.timestampToDateWithTime(update.editedTimestamp || update.createdTimestamp)}
                        </p>
                        {#if update.image}
                            <a href={update.image} target="_blank" rel="noreferrer">Open update image</a>
                        {/if}
                    </article>
                {:else}
                    <article class="mini-card">
                        <p>No current updates are being returned by the upstream feed.</p>
                    </article>
                {/each}
            </div>
        {/if}
    </section>

    <section class="panel-card">
        <h2>Current DevCore News Payload</h2>
        <article class="mini-card">
            <p><strong>Title:</strong> {homepageNews.title}</p>
            <p><strong>See more link:</strong> <a href={homepageNews.seeMoreHref}>{homepageNews.seeMoreHref}</a></p>
            <p><strong>Image:</strong> {homepageNews.image.src}</p>
            <div class="stack tight">
                {#each homepageNews.body as paragraph}
                    <p>{paragraph}</p>
                {/each}
            </div>
        </article>
    </section>

    <section class="panel-card">
        <h2>Live Front Page Rails</h2>
        {#if frontpageLoading}
            <p>Loading front page project rails...</p>
        {:else if frontpageError}
            <p class="error-text">Failed to load the current featured, voted, latest, or tagged project data.</p>
        {:else}
            <div class="stack">
                {#each homepageSections as section}
                    <section class="section-block">
                        <div class="section-header">
                            <h3>{section.label}</h3>
                            <p>{section.items.length} projects</p>
                        </div>
                        <div class="project-grid">
                            {#each section.items as project}
                                <a class="project-card" href={buildSharedProjectPath(project.id)}>
                                    <img
                                        src={PenguinModClient.projects.getProjectThumbnailURL(project.id)}
                                        alt={project.title}
                                    />
                                    <div class="project-copy">
                                        <h4>{project.title}</h4>
                                        <p>@{project.author?.username || "unknown"}</p>
                                        <p>ID: {project.id}</p>
                                    </div>
                                </a>
                            {:else}
                                <article class="mini-card">
                                    <p>No projects currently returned for this rail.</p>
                                </article>
                            {/each}
                        </div>
                    </section>
                {/each}
            </div>
        {/if}
    </section>

    <section class="panel-card">
        <h2>Critical Repos To Fold Into One DevCore Runtime</h2>
        <div class="repo-grid">
            {#each runtimeRepos.criticalPath as repo}
                <article class="repo-card">
                    <h3><a href={repo.repoUrl} target="_blank" rel="noreferrer">{repo.name}</a></h3>
                    <p>{repo.why}</p>
                    <p><strong>DevCore path:</strong> {repo.devcorePath || "Not copied in yet"}</p>
                </article>
            {/each}
        </div>
    </section>

    <section class="panel-card two-col">
        <div>
            <h2>Phase Two Repos</h2>
            <div class="stack">
                {#each runtimeRepos.phaseTwo as repo}
                    <article class="mini-card">
                        <h3><a href={repo.repoUrl} target="_blank" rel="noreferrer">{repo.name}</a></h3>
                        <p>{repo.why}</p>
                        <p><strong>DevCore path:</strong> {repo.devcorePath || "Not copied in yet"}</p>
                    </article>
                {/each}
            </div>
        </div>
        <div>
            <h2>Archived Or Excluded Repos</h2>
            <div class="stack">
                {#each runtimeRepos.archivedOrExcluded as repo}
                    <article class="mini-card muted-card">
                        <h3><a href={repo.repoUrl} target="_blank" rel="noreferrer">{repo.name}</a></h3>
                        <p>{repo.why}</p>
                    </article>
                {/each}
            </div>
        </div>
    </section>

    {#if runtimeRepos.missingFromRepo.length > 0}
        <section class="panel-card">
            <h2>Needed Repos Still Missing From DevCore</h2>
            <div class="stack">
                {#each runtimeRepos.missingFromRepo as repo}
                    <article class="mini-card muted-card">
                        <h3><a href={repo.repoUrl} target="_blank" rel="noreferrer">{repo.name}</a></h3>
                        <p>{repo.why}</p>
                    </article>
                {/each}
            </div>
        </section>
    {/if}
</main>

<style>
    .panel-page {
        min-height: calc(100vh - 3rem);
        padding: 5rem 1.5rem 3rem;
        background:
            radial-gradient(circle at top left, rgba(39, 191, 36, 0.2), transparent 28rem),
            linear-gradient(180deg, rgba(255, 159, 26, 0.08), transparent 24rem),
            #f7fbf6;
        display: grid;
        gap: 1.25rem;
    }

    .panel-card {
        width: min(72rem, 100%);
        margin: 0 auto;
        padding: 1.5rem;
        border-radius: 1.25rem;
        background: rgba(255, 255, 255, 0.88);
        box-shadow: 0 20px 45px rgba(10, 26, 40, 0.12);
        line-height: 1.6;
    }

    .hero-card {
        background:
            linear-gradient(135deg, rgba(39, 191, 36, 0.14), rgba(255, 255, 255, 0.95)),
            rgba(255, 255, 255, 0.88);
    }

    .eyebrow {
        margin: 0;
        color: var(--devcore-topbar, #27bf24);
        font-size: 0.85rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }

    h1,
    h2,
    h3 {
        margin-block-start: 0;
    }

    h1 {
        margin: 0.35rem 0 1rem;
    }

    h2 {
        margin-bottom: 1rem;
    }

    .stack {
        display: grid;
        gap: 0.9rem;
    }

    .overview-grid,
    .project-grid {
        display: grid;
        gap: 0.9rem;
        grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
    }

    .tight {
        gap: 0.45rem;
    }

    .mini-card,
    .repo-card {
        padding: 1rem;
        border-radius: 1rem;
        background: rgba(39, 191, 36, 0.06);
        border: 1px solid rgba(39, 191, 36, 0.12);
    }

    .muted-card {
        background: rgba(16, 82, 20, 0.04);
        border-color: rgba(16, 82, 20, 0.12);
    }

    .repo-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
        gap: 0.9rem;
    }

    .section-block {
        display: grid;
        gap: 0.9rem;
    }

    .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }

    .section-header h3,
    .section-header p,
    .project-copy h4,
    .project-copy p {
        margin: 0;
    }

    .project-card {
        display: grid;
        gap: 0.75rem;
        padding: 0.85rem;
        border-radius: 1rem;
        background: rgba(39, 191, 36, 0.08);
        border: 1px solid rgba(39, 191, 36, 0.14);
        color: inherit;
        text-decoration: none;
    }

    .project-card img {
        width: 100%;
        aspect-ratio: 4 / 3;
        object-fit: cover;
        border-radius: 0.75rem;
        background: rgba(16, 82, 20, 0.08);
    }

    .project-copy {
        display: grid;
        gap: 0.35rem;
    }

    .error-text {
        color: #b42318;
        font-weight: 700;
    }

    .two-col {
        display: grid;
        gap: 1.25rem;
        grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
    }

    a {
        color: var(--devcore-topbar, #27bf24);
        font-weight: 700;
    }

    :global(body.app-theme-dark) .panel-page {
        background:
            radial-gradient(circle at top left, rgba(39, 191, 36, 0.16), transparent 28rem),
            linear-gradient(180deg, rgba(255, 159, 26, 0.07), transparent 24rem),
            #111;
    }

    :global(body.app-theme-dark) .panel-card {
        background: rgba(17, 17, 17, 0.9);
        box-shadow: 0 20px 45px rgba(0, 0, 0, 0.35);
    }
</style>
