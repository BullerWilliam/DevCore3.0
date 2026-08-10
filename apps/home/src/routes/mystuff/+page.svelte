<script>
    import { browser } from "$app/environment";
    import { PUBLIC_STUDIO_URL } from "$lib/resources/public-env";
    import DevCorePublicProfileAPI from "$lib/resources/devcore/public-profile-api";
    import { buildSharedProjectPath } from "$lib/resources/site-paths";
    import StoreSession from "$lib/stores/session";

    const defaultUsername = "devcore";

    let selectedUsername = $state(defaultUsername);
    let loading = $state(true);
    let loadError = $state(null);
    let profile = $state(null);

    const totalProjects = $derived(profile?.projects?.length || 0);
    const featuredProjects = $derived(profile?.projects?.filter(project => project.featured) || []);
    const projectRows = $derived(profile?.projects || []);

    const formatDate = value => {
        if (!value) return "Unknown";
        return new Date(value).toLocaleDateString(undefined, {
            dateStyle: "medium",
        });
    };

    const resolveSelectedUsername = () => {
        const params = new URLSearchParams(window.location.search);
        const requestedUsername = params.get("user");
        const cachedUsername = $StoreSession.userCachedUsername;
        return requestedUsername || cachedUsername || defaultUsername;
    };

    const loadWorkspace = async () => {
        if (!browser) return;

        loading = true;
        loadError = null;
        profile = null;
        selectedUsername = resolveSelectedUsername();

        try {
            profile = await DevCorePublicProfileAPI.getProfile(selectedUsername);
        } catch (error) {
            console.error(error);
            loadError = error;
        } finally {
            loading = false;
        }
    };

    if (browser) {
        loadWorkspace();
    }
</script>

<svelte:head>
    <title>DevCore My Stuff</title>
</svelte:head>

<main class="workspace-page">
    {#if loading}
        <section class="workspace-card">
            <p class="eyebrow">DevCore</p>
            <h1>Loading My Stuff...</h1>
            <p>Opening the owned DevCore project workspace snapshot.</p>
        </section>
    {:else if loadError}
        <section class="workspace-card">
            <p class="eyebrow">DevCore</p>
            <h1>My Stuff is temporarily unavailable</h1>
            <p>The read-only DevCore project workspace could not be loaded right now.</p>
            <p>
                You can still
                <a href={PUBLIC_STUDIO_URL}>open the DevCore studio</a>
                for the upstream project manager.
            </p>
        </section>
    {:else if !profile}
        <section class="workspace-card">
            <p class="eyebrow">DevCore</p>
            <h1>My Stuff</h1>
            <p>
                No owned project workspace snapshot is available for <strong>{selectedUsername}</strong> yet.
            </p>
            <p>
                The unified deployment can now mirror public creator profiles, but uploads, saves,
                and writable project management are still part of the larger backend migration.
            </p>
            <p>
                You can still
                <a href={PUBLIC_STUDIO_URL}>open the DevCore studio</a>
                for the upstream project manager.
            </p>
        </section>
    {:else}
        <section class="workspace-card hero-card">
            <div>
                <p class="eyebrow">DevCore</p>
                <h1>My Stuff</h1>
                <p class="subcopy">
                    Read-only owned workspace for <strong>@{profile.username}</strong>
                </p>
                <p>
                    This menu now reads from the same DevCore-owned homepage catalog as the new public
                    profile surface, so the unified Vercel project can show real mirrored project data
                    without bouncing back to the legacy studio.
                </p>
            </div>
            <div class="hero-stats">
                <article class="stat-card">
                    <p class="stat-label">Projects</p>
                    <p class="stat-value">{totalProjects}</p>
                </article>
                <article class="stat-card">
                    <p class="stat-label">Featured</p>
                    <p class="stat-value">{featuredProjects.length}</p>
                </article>
            </div>
        </section>

        <section class="workspace-grid">
            <article class="workspace-card">
                <h2>Workspace status</h2>
                <p>
                    You're looking at the owned DevCore project mirror for this creator. Editing,
                    uploads, deletes, and cloud-save flows still need the real backend to be folded in.
                </p>
                <p class="meta-note">
                    Mirror date: {profile.mirroredAt || "Unknown"}
                </p>
            </article>

            <article class="workspace-card">
                <h2>Quick links</h2>
                <div class="quick-links">
                    <a href={`/profile?user=${encodeURIComponent(profile.username)}`}>Open public profile</a>
                    <a href={PUBLIC_STUDIO_URL}>Open upstream studio</a>
                </div>
            </article>
        </section>

        <section class="workspace-card">
            <div class="section-head">
                <h2>Cataloged projects</h2>
                <p>{projectRows.length} mirrored projects</p>
            </div>
            {#if projectRows.length > 0}
                <div class="project-grid">
                    {#each projectRows as project}
                        <a class="project-card" href={buildSharedProjectPath(project.id)}>
                            <div class="project-head">
                                <p class="project-title">{project.title}</p>
                                {#if project.featured}
                                    <span class="project-pill">Featured</span>
                                {/if}
                            </div>
                            <p class="project-meta">
                                {project.views} views - {project.loves} loves - {project.votes} votes
                            </p>
                            <p class="project-date">
                                Updated {formatDate(project.lastUpdate || project.date)}
                            </p>
                        </a>
                    {/each}
                </div>
            {:else}
                <p>No mirrored projects are attached to this workspace yet.</p>
            {/if}
        </section>
    {/if}
</main>

<style>
    .workspace-page {
        min-height: calc(100vh - 3rem);
        padding: 4rem 1.5rem 3rem;
        background:
            radial-gradient(circle at top left, rgba(39, 191, 36, 0.18), transparent 28rem),
            linear-gradient(180deg, rgba(255, 159, 26, 0.08), transparent 24rem);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.25rem;
    }

    .workspace-card,
    .workspace-grid {
        width: min(70rem, 100%);
    }

    .workspace-card {
        padding: 1.5rem;
        border-radius: 1.25rem;
        background: rgba(255, 255, 255, 0.84);
        box-shadow: 0 20px 45px rgba(10, 26, 40, 0.12);
        line-height: 1.6;
    }

    .hero-card {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: flex-start;
    }

    .workspace-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
    }

    .hero-stats {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.85rem;
        min-width: 16rem;
    }

    .stat-card {
        padding: 1rem;
        border-radius: 1rem;
        background: rgba(247, 251, 247, 0.96);
        border: 1px solid rgba(39, 191, 36, 0.14);
    }

    .stat-label,
    .stat-value,
    .project-title,
    .project-meta,
    .project-date,
    .meta-note {
        margin: 0;
    }

    .stat-label,
    .subcopy,
    .project-meta,
    .project-date,
    .meta-note {
        color: rgba(16, 35, 20, 0.72);
    }

    .stat-value {
        margin-top: 0.35rem;
        font-size: 1.5rem;
        font-weight: 800;
        color: #0f3413;
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
    h2 {
        margin-top: 0;
    }

    .quick-links {
        display: flex;
        flex-wrap: wrap;
        gap: 0.8rem;
    }

    .section-head {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: baseline;
    }

    .section-head h2,
    .section-head p {
        margin: 0 0 0.75rem;
    }

    .project-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.85rem;
    }

    .project-card {
        padding: 1rem 1.1rem;
        border-radius: 1rem;
        text-decoration: none;
        background: rgba(247, 251, 247, 0.96);
        border: 1px solid rgba(39, 191, 36, 0.14);
        transition: transform 0.12s ease, box-shadow 0.12s ease;
    }

    .project-card:hover {
        transform: translateY(-1px);
        box-shadow: 0 14px 24px rgba(10, 26, 40, 0.08);
    }

    .project-head {
        display: flex;
        gap: 0.75rem;
        justify-content: space-between;
        align-items: flex-start;
    }

    .project-title {
        font-weight: 800;
        color: #12311a;
    }

    .project-meta,
    .project-date {
        margin-top: 0.35rem;
    }

    .project-pill {
        padding: 0.25rem 0.55rem;
        border-radius: 999px;
        background: rgba(39, 191, 36, 0.12);
        color: #167326;
        font-size: 0.8rem;
        font-weight: 700;
        white-space: nowrap;
    }

    a {
        color: var(--devcore-topbar, #27bf24);
        font-weight: 700;
    }

    :global(body.app-theme-dark) .workspace-card {
        background: rgba(17, 17, 17, 0.88);
    }

    :global(body.app-theme-dark) .stat-card,
    :global(body.app-theme-dark) .project-card {
        background: rgba(27, 31, 27, 0.96);
        border-color: rgba(84, 214, 98, 0.18);
    }

    :global(body.app-theme-dark) .stat-value,
    :global(body.app-theme-dark) .project-title {
        color: #e8ffe6;
    }

    :global(body.app-theme-dark) .stat-label,
    :global(body.app-theme-dark) .subcopy,
    :global(body.app-theme-dark) .project-meta,
    :global(body.app-theme-dark) .project-date,
    :global(body.app-theme-dark) .meta-note {
        color: rgba(232, 255, 230, 0.72);
    }

    :global(body.app-theme-dark) .project-pill {
        background: rgba(84, 214, 98, 0.16);
        color: #cbffcb;
    }

    @media (max-width: 900px) {
        .workspace-grid,
        .project-grid,
        .hero-stats {
            grid-template-columns: 1fr;
        }

        .hero-card {
            flex-direction: column;
        }
    }
</style>
