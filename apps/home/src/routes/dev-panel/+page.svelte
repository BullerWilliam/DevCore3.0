<script>
    import homepageNews from "$lib/content/dev-panel/homepage-news";
    import runtimeRepos from "$lib/content/dev-panel/runtime-repos";

    const contentSources = [
        {
            label: "Featured / voted / latest project rails",
            source: "PenguinMod-BackendApi frontpage project endpoints",
            status: "Not yet editable from DevCore",
            next: "Move featured and homepage curation into a DevCore-owned admin backend."
        },
        {
            label: "What's New block",
            source: "PenguinMod-BasicApi updates feed",
            status: "Read-only from DevCore",
            next: "Replace with a DevCore-owned updates store once the backend is unified."
        },
        {
            label: "DevCore News block",
            source: "$lib/content/dev-panel/homepage-news.js",
            status: "Editable in-repo now",
            next: "Replace file-backed content with authenticated admin editing later."
        }
    ];
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
            tracks which public PenguinMod repos are actually needed for the live stack and where
            the homepage content is currently sourced from.
        </p>
        <p>
            Reviewed upstream repos: <strong>{runtimeRepos.reviewedRepoCount}</strong> as of
            <strong>{runtimeRepos.reviewDate}</strong>.
        </p>
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
        <h2>Critical Repos To Fold Into One DevCore Runtime</h2>
        <div class="repo-grid">
            {#each runtimeRepos.criticalPath as repo}
                <article class="repo-card">
                    <h3>{repo.name}</h3>
                    <p>{repo.why}</p>
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
                        <h3>{repo.name}</h3>
                        <p>{repo.why}</p>
                    </article>
                {/each}
            </div>
        </div>
        <div>
            <h2>Archived Or Excluded Repos</h2>
            <div class="stack">
                {#each runtimeRepos.archivedOrExcluded as repo}
                    <article class="mini-card muted-card">
                        <h3>{repo.name}</h3>
                        <p>{repo.why}</p>
                    </article>
                {/each}
            </div>
        </div>
    </section>
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
