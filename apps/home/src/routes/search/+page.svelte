<script>
    import { browser } from "$app/environment";
    import { page } from "$app/stores";

    import PenguinModClient from "$lib/resources/penguinmod/client";
    import { buildSharedProjectPath } from "$lib/resources/site-paths";

    const SEARCH_PAGE_SIZE = 20;

    let loading = $state(true);
    let loadingMore = $state(false);
    let loadError = $state(null);
    let activeQuery = $state("");
    let searchMode = $state("project");
    let searchType = $state("views");
    let pageIndex = $state(0);
    let reverse = $state(false);
    let results = $state([]);
    let pageIsLast = $state(false);

    const normalizedHeadline = $derived(activeQuery || "Browse projects");

    const decodeBoolean = (value) => value === "true" || value === "1";

    const parseQuery = (rawQuery) => {
        const query = `${rawQuery || ""}`.trim();
        const lower = query.toLowerCase();

        if (lower.startsWith("user:")) {
            return {
                mode: "user",
                type: "views",
                query: query.slice(5).trim(),
            };
        }

        const sortablePrefixes = ["featured:", "newest:", "uploaddate:", "views:"];
        for (const prefix of sortablePrefixes) {
            if (lower.startsWith(prefix)) {
                return {
                    mode: "project",
                    type: prefix.slice(0, -1),
                    query: query.slice(prefix.length).trim(),
                };
            }
        }

        return {
            mode: "project",
            type: "views",
            query,
        };
    };

    const serializeQuery = () => {
        if (searchMode === "user") {
            return activeQuery ? `user:${activeQuery}` : "user:";
        }

        if (searchType !== "views") {
            return `${searchType}:${activeQuery}`;
        }

        return activeQuery;
    };

    const updateUrlState = () => {
        if (!browser) return;

        const url = new URL(window.location.href);
        const serializedQuery = serializeQuery();
        if (serializedQuery) {
            url.searchParams.set("q", serializedQuery);
        } else {
            url.searchParams.delete("q");
        }

        if (pageIndex > 0) {
            url.searchParams.set("page", `${pageIndex}`);
        } else {
            url.searchParams.delete("page");
        }

        if (reverse) {
            url.searchParams.set("reverse", "true");
        } else {
            url.searchParams.delete("reverse");
        }

        window.history.replaceState({}, "", `${url.pathname}${url.search}`);
    };

    const fetchResultsPage = async (requestedPage) => {
        if (searchMode === "user") {
            return await PenguinModClient.users.searchUsers(activeQuery, requestedPage);
        }

        return await PenguinModClient.projects.searchProjects(
            activeQuery,
            searchType,
            requestedPage,
            reverse
        );
    };

    const loadResults = async ({ append = false } = {}) => {
        if (!browser) return;

        if (append) {
            loadingMore = true;
        } else {
            loading = true;
            results = [];
            pageIsLast = false;
        }

        loadError = null;

        try {
            const newResults = await fetchResultsPage(pageIndex);
            results = append ? [...results, ...newResults] : newResults;
            pageIsLast = newResults.length < SEARCH_PAGE_SIZE;
            updateUrlState();
        } catch (error) {
            console.error(error);
            loadError = error;
            if (append) {
                pageIndex = Math.max(pageIndex - 1, 0);
            }
        } finally {
            loading = false;
            loadingMore = false;
        }
    };

    const syncFromLocation = async () => {
        const currentPage = $page;
        const rawQuery = currentPage.url.searchParams.get("q") || "";
        const nextPage = Number(currentPage.url.searchParams.get("page") || "0");
        const nextReverse = decodeBoolean(currentPage.url.searchParams.get("reverse") || "");
        const parsed = parseQuery(rawQuery);

        const pageChanged = pageIndex !== (Number.isFinite(nextPage) && nextPage >= 0 ? nextPage : 0);
        const queryChanged = activeQuery !== parsed.query || searchMode !== parsed.mode || searchType !== parsed.type || reverse !== nextReverse;

        activeQuery = parsed.query;
        searchMode = parsed.mode;
        searchType = parsed.type;
        reverse = nextReverse;
        pageIndex = Number.isFinite(nextPage) && nextPage >= 0 ? nextPage : 0;

        if (queryChanged || pageChanged || loading) {
            await loadResults();
        }
    };

    const loadMore = async () => {
        if (loadingMore || pageIsLast) return;
        pageIndex += 1;
        await loadResults({ append: true });
    };

    $effect(() => {
        if (!browser) return;
        $page.url.search;
        syncFromLocation();
    });
</script>

<svelte:head>
    <title>DevCore Search</title>
</svelte:head>

<main class="search-page">
    <section class="search-hero">
        <p class="eyebrow">DevCore Search</p>
        <h1>{searchMode === "user" ? "User search" : "Project search"}</h1>
        <p>
            {#if activeQuery}
                Showing results for <strong>{normalizedHeadline}</strong>.
            {:else}
                Showing the latest search feed for the unified DevCore catalog.
            {/if}
        </p>
        <div class="query-pills">
            <span class="query-pill">{searchMode === "user" ? "Users" : "Projects"}</span>
            {#if searchMode === "project"}
                <span class="query-pill">Sort: {searchType}</span>
            {/if}
            {#if reverse}
                <span class="query-pill">Reversed</span>
            {/if}
        </div>
    </section>

    {#if loading}
        <section class="results-card">
            <h2>Loading results...</h2>
            <p>Querying the owned DevCore site stack.</p>
        </section>
    {:else if loadError}
        <section class="results-card">
            <h2>Search is temporarily unavailable</h2>
            <p>
                The unified DevCore search page could not load results right now.
            </p>
        </section>
    {:else if results.length <= 0}
        <section class="results-card">
            <h2>No results found</h2>
            <p>
                Try another query, or search with prefixes like <code>user:</code>,
                <code>featured:</code>, or <code>newest:</code>.
            </p>
        </section>
    {:else if searchMode === "user"}
        <section class="results-card">
            <div class="section-head">
                <h2>Users</h2>
                <p>{results.length} loaded</p>
            </div>

            <div class="user-grid">
                {#each results as user}
                    <a class="user-card" href={`/profile?user=${encodeURIComponent(user.username)}`}>
                        <img
                            src={PenguinModClient.users.getPfpUrl(user.username)}
                            alt={user.username}
                            class="user-avatar"
                        />
                        <div>
                            <p class="user-name">{user.username}</p>
                            <p class="user-meta">Open DevCore profile</p>
                        </div>
                    </a>
                {/each}
            </div>
        </section>
    {:else}
        <section class="results-card">
            <div class="section-head">
                <h2>Projects</h2>
                <p>{results.length} loaded</p>
            </div>

            <div class="project-grid">
                {#each results as project}
                    <a class="project-card" href={buildSharedProjectPath(project.id)}>
                        <img
                            src={PenguinModClient.projects.getProjectThumbnailURL(project.id)}
                            alt={project.title}
                            class="project-thumb"
                        />
                        <div class="project-copy">
                            <p class="project-title">{project.title}</p>
                            <p class="project-meta">
                                by {project.author?.username || "unknown"} - {project.views || 0} views - {project.loves || 0} loves
                            </p>
                        </div>
                    </a>
                {/each}
            </div>
        </section>
    {/if}

    {#if !loading && !loadError && results.length > 0 && !pageIsLast}
        <div class="load-more-wrap">
            <button class="load-more-button" type="button" onclick={loadMore} disabled={loadingMore}>
                {#if loadingMore}
                    Loading more...
                {:else}
                    Load more
                {/if}
            </button>
        </div>
    {/if}
</main>

<style>
    .search-page {
        min-height: calc(100vh - 3rem);
        padding: 3.25rem 1.5rem 3rem;
        background:
            radial-gradient(circle at top left, rgba(39, 191, 36, 0.18), transparent 28rem),
            linear-gradient(180deg, rgba(255, 159, 26, 0.08), transparent 24rem);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.25rem;
    }

    .search-hero,
    .results-card,
    .load-more-wrap {
        width: min(72rem, 100%);
    }

    .search-hero,
    .results-card {
        padding: 1.5rem;
        border-radius: 1.25rem;
        background: rgba(255, 255, 255, 0.84);
        box-shadow: 0 20px 45px rgba(10, 26, 40, 0.12);
        line-height: 1.6;
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
    p {
        margin-top: 0;
    }

    .query-pills {
        display: flex;
        flex-wrap: wrap;
        gap: 0.7rem;
        margin-top: 1rem;
    }

    .query-pill {
        padding: 0.35rem 0.7rem;
        border-radius: 999px;
        background: rgba(39, 191, 36, 0.12);
        color: #167326;
        font-size: 0.85rem;
        font-weight: 700;
    }

    .section-head {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: baseline;
    }

    .section-head h2,
    .section-head p {
        margin: 0 0 0.85rem;
    }

    .project-grid,
    .user-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.95rem;
    }

    .project-card,
    .user-card {
        text-decoration: none;
        border-radius: 1rem;
        overflow: hidden;
        background: rgba(247, 251, 247, 0.96);
        border: 1px solid rgba(39, 191, 36, 0.14);
        transition: transform 0.12s ease, box-shadow 0.12s ease;
    }

    .project-card:hover,
    .user-card:hover {
        transform: translateY(-1px);
        box-shadow: 0 14px 24px rgba(10, 26, 40, 0.08);
    }

    .project-thumb {
        width: 100%;
        aspect-ratio: 4 / 3;
        object-fit: cover;
        display: block;
        background: rgba(39, 191, 36, 0.08);
    }

    .project-copy {
        padding: 0.95rem 1rem 1rem;
    }

    .project-title,
    .project-meta,
    .user-name,
    .user-meta {
        margin: 0;
    }

    .project-title,
    .user-name {
        font-weight: 800;
        color: #12311a;
    }

    .project-meta,
    .user-meta {
        margin-top: 0.35rem;
        color: rgba(16, 35, 20, 0.72);
    }

    .user-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
    }

    .user-avatar {
        width: 4.5rem;
        height: 4.5rem;
        border-radius: 0.9rem;
        object-fit: cover;
        background: rgba(39, 191, 36, 0.1);
        flex-shrink: 0;
    }

    .load-more-wrap {
        display: flex;
        justify-content: center;
    }

    .load-more-button {
        border: 0;
        border-radius: 999px;
        padding: 0.9rem 1.25rem;
        background: var(--devcore-topbar, #27bf24);
        color: white;
        font-size: 0.95rem;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 14px 28px rgba(39, 191, 36, 0.24);
    }

    .load-more-button:disabled {
        cursor: progress;
        opacity: 0.78;
    }

    code {
        font-family: "Consolas", "Courier New", monospace;
    }

    :global(body.app-theme-dark) .search-hero,
    :global(body.app-theme-dark) .results-card {
        background: rgba(17, 17, 17, 0.88);
    }

    :global(body.app-theme-dark) .project-card,
    :global(body.app-theme-dark) .user-card {
        background: rgba(27, 31, 27, 0.96);
        border-color: rgba(84, 214, 98, 0.18);
    }

    :global(body.app-theme-dark) .project-title,
    :global(body.app-theme-dark) .user-name {
        color: #e8ffe6;
    }

    :global(body.app-theme-dark) .project-meta,
    :global(body.app-theme-dark) .user-meta {
        color: rgba(232, 255, 230, 0.72);
    }

    :global(body.app-theme-dark) .query-pill {
        background: rgba(84, 214, 98, 0.16);
        color: #cbffcb;
    }

    @media (max-width: 900px) {
        .project-grid,
        .user-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
