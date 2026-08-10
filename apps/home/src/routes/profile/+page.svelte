<script>
    import { browser } from "$app/environment";
    import { PUBLIC_STUDIO_URL } from "$lib/resources/public-env";
    import DevCorePublicProfileAPI from "$lib/resources/devcore/public-profile-api";
    import { buildSharedProjectPath } from "$lib/resources/site-paths";

    const defaultUsername = "devcore";

    let requestedUsername = $state(defaultUsername);
    let postId = $state(null);
    let loading = $state(true);
    let loadError = $state(null);
    let profile = $state(null);

    const formatDate = value => {
        if (!value) return "Unknown";
        return new Date(value).toLocaleDateString(undefined, {
            dateStyle: "medium",
        });
    };

    const featuredProject = $derived(
        profile?.projects?.find(project => project.featured) || profile?.projects?.[0] || null
    );

    const profileTitle = $derived(profile?.displayName || requestedUsername || "DevCore profile");

    const overviewStats = $derived(
        profile
            ? [
                {
                    label: "Cataloged projects",
                    value: `${profile.projectCount || 0}`,
                },
                {
                    label: "Featured projects",
                    value: `${profile.featuredProjectCount || 0}`,
                },
                {
                    label: "Total loves",
                    value: `${profile.totalLoves || 0}`,
                },
                {
                    label: "Mirror date",
                    value: profile.mirroredAt || "Unknown",
                },
            ]
            : []
    );

    const loadProfile = async () => {
        if (!browser) return;

        loading = true;
        loadError = null;
        profile = null;

        const params = new URLSearchParams(window.location.search);
        requestedUsername = params.get("user") || defaultUsername;
        postId = params.get("post");

        try {
            profile = await DevCorePublicProfileAPI.getProfile(requestedUsername);
        } catch (error) {
            console.error(error);
            loadError = error;
        } finally {
            loading = false;
        }
    };

    if (browser) {
        loadProfile();
    }
</script>

<svelte:head>
    <title>{profileTitle} on DevCore</title>
</svelte:head>

<main class="info-page">
    {#if loading}
        <section class="info-card">
            <p class="eyebrow">DevCore</p>
            <h1>Loading profile...</h1>
            <p>Fetching the owned DevCore public profile snapshot.</p>
        </section>
    {:else if loadError}
        <section class="info-card">
            <p class="eyebrow">DevCore</p>
            <h1>Profile temporarily unavailable</h1>
            <p>
                The unified DevCore profile snapshot could not be loaded right now.
            </p>
            <p>
                If you need the upstream experience immediately, you can still
                <a href={PUBLIC_STUDIO_URL}>open the DevCore studio</a>.
            </p>
        </section>
    {:else if !profile}
        <section class="info-card">
            <p class="eyebrow">DevCore</p>
            <h1>{requestedUsername}</h1>
            <p>
                This user is not in DevCore's owned public profile catalog yet.
            </p>
            <p>
                Right now the unified profile page only covers creators present in the owned homepage
                mirror while the full account system is being folded into one deployment.
            </p>
            <p>
                You can still
                <a href={PUBLIC_STUDIO_URL}>open the DevCore studio</a>
                for the upstream experience.
            </p>
        </section>
    {:else}
        <section class="hero-card">
            <div class="avatar-badge">{profile.displayName?.slice(0, 1) || "D"}</div>
            <div class="hero-copy">
                <p class="eyebrow">DevCore Public Profile</p>
                <h1>{profile.displayName}</h1>
                <p class="subcopy">@{profile.username}</p>
                <p>{profile.bio}</p>
                {#if postId}
                    <p class="feed-note">
                        Linked here from feed post <strong>{postId}</strong>.
                    </p>
                {/if}
            </div>
        </section>

        <section class="overview-grid">
            {#each overviewStats as item}
                <article class="mini-card">
                    <p class="mini-label">{item.label}</p>
                    <p class="mini-value">{item.value}</p>
                </article>
            {/each}
        </section>

        <section class="two-col">
            <article class="info-card">
                <h2>Badges</h2>
                {#if profile.badges?.length > 0}
                    <div class="badge-row">
                        {#each profile.badges as badge}
                            <span class="badge-chip">{badge}</span>
                        {/each}
                    </div>
                {:else}
                    <p>No public badges are mirrored for this creator yet.</p>
                {/if}
                <p class="meta-note">
                    Source: {profile.ownershipMode}
                </p>
            </article>

            <article class="info-card">
                <h2>Profile coverage</h2>
                <p>
                    This page is powered by the owned DevCore homepage project catalog inside the
                    unified Vercel deployment.
                </p>
                <p>
                    Writable profile editing, follower counts, and full account state are still part
                    of the larger backend migration.
                </p>
            </article>
        </section>

        {#if featuredProject}
            <section class="info-card">
                <div class="section-head">
                    <h2>Spotlight project</h2>
                    <a href={buildSharedProjectPath(featuredProject.id)}>Open in player</a>
                </div>
                <article class="project-spotlight">
                    <div>
                        <h3>{featuredProject.title}</h3>
                        <p>
                            {featuredProject.featured ? "Featured in the owned catalog" : "Primary mirrored project"}
                        </p>
                    </div>
                    <div class="spotlight-stats">
                        <span>{featuredProject.views} views</span>
                        <span>{featuredProject.loves} loves</span>
                        <span>{featuredProject.votes} votes</span>
                        <span>Updated {formatDate(featuredProject.lastUpdate || featuredProject.date)}</span>
                    </div>
                </article>
            </section>
        {/if}

        <section class="info-card">
            <div class="section-head">
                <h2>Cataloged projects</h2>
                <p>{profile.projects?.length || 0} mirrored projects</p>
            </div>
            {#if profile.projects?.length > 0}
                <div class="project-grid">
                    {#each profile.projects as project}
                        <a class="project-card" href={buildSharedProjectPath(project.id)}>
                            <p class="project-title">{project.title}</p>
                            <p class="project-meta">
                                {project.featured ? "Featured" : "Cataloged"} - {project.loves} loves - {project.views} views
                            </p>
                            <p class="project-date">
                                Updated {formatDate(project.lastUpdate || project.date)}
                            </p>
                        </a>
                    {/each}
                </div>
            {:else}
                <p>No mirrored projects are attached to this profile yet.</p>
            {/if}
        </section>
    {/if}
</main>

<style>
    .info-page {
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

    .hero-card,
    .info-card,
    .overview-grid,
    .two-col {
        width: min(70rem, 100%);
    }

    .hero-card,
    .info-card {
        padding: 1.5rem;
        border-radius: 1.25rem;
        background: rgba(255, 255, 255, 0.84);
        box-shadow: 0 20px 45px rgba(10, 26, 40, 0.12);
        line-height: 1.6;
    }

    .hero-card {
        display: flex;
        gap: 1.25rem;
        align-items: flex-start;
    }

    .avatar-badge {
        width: 5rem;
        height: 5rem;
        border-radius: 1.4rem;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background:
            linear-gradient(135deg, rgba(39, 191, 36, 0.9), rgba(16, 151, 67, 0.95));
        color: white;
        font-size: 2rem;
        font-weight: 800;
        text-transform: uppercase;
    }

    .hero-copy h1,
    .hero-copy p,
    .info-card h2,
    .info-card h3 {
        margin-top: 0;
    }

    .eyebrow {
        margin: 0;
        color: var(--devcore-topbar, #27bf24);
        font-size: 0.85rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }

    h1 {
        margin: 0.35rem 0 0.35rem;
        overflow-wrap: anywhere;
    }

    .subcopy,
    .feed-note,
    .mini-label,
    .project-meta,
    .project-date,
    .meta-note {
        color: rgba(16, 35, 20, 0.72);
    }

    .feed-note {
        margin-bottom: 0;
    }

    .overview-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 1rem;
    }

    .mini-card {
        padding: 1rem 1.1rem;
        border-radius: 1rem;
        background: rgba(255, 255, 255, 0.8);
        box-shadow: 0 16px 34px rgba(10, 26, 40, 0.08);
    }

    .mini-label,
    .mini-value {
        margin: 0;
    }

    .mini-label {
        font-size: 0.82rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
    }

    .mini-value {
        margin-top: 0.35rem;
        font-size: 1.35rem;
        font-weight: 800;
        color: #0f3413;
    }

    .two-col {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
    }

    .badge-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.65rem;
    }

    .badge-chip {
        padding: 0.45rem 0.8rem;
        border-radius: 999px;
        background: rgba(39, 191, 36, 0.12);
        color: #167326;
        font-size: 0.9rem;
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
        margin: 0 0 0.75rem;
    }

    .project-spotlight {
        padding: 1rem 1.1rem;
        border-radius: 1rem;
        background:
            linear-gradient(135deg, rgba(39, 191, 36, 0.08), rgba(255, 159, 26, 0.12));
    }

    .spotlight-stats {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem 1rem;
        margin-top: 0.85rem;
        font-weight: 700;
        color: #195725;
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

    .project-title,
    .project-meta,
    .project-date {
        margin: 0;
    }

    .project-title {
        font-weight: 800;
        color: #12311a;
    }

    .project-meta,
    .project-date {
        margin-top: 0.35rem;
    }

    a {
        color: var(--devcore-topbar, #27bf24);
        font-weight: 700;
    }

    :global(body.app-theme-dark) .hero-card,
    :global(body.app-theme-dark) .info-card,
    :global(body.app-theme-dark) .mini-card {
        background: rgba(17, 17, 17, 0.88);
    }

    :global(body.app-theme-dark) .mini-value,
    :global(body.app-theme-dark) .project-title,
    :global(body.app-theme-dark) .spotlight-stats {
        color: #e8ffe6;
    }

    :global(body.app-theme-dark) .subcopy,
    :global(body.app-theme-dark) .feed-note,
    :global(body.app-theme-dark) .mini-label,
    :global(body.app-theme-dark) .project-meta,
    :global(body.app-theme-dark) .project-date,
    :global(body.app-theme-dark) .meta-note {
        color: rgba(232, 255, 230, 0.72);
    }

    :global(body.app-theme-dark) .project-card {
        background: rgba(27, 31, 27, 0.96);
        border-color: rgba(84, 214, 98, 0.18);
    }

    :global(body.app-theme-dark) .project-spotlight {
        background:
            linear-gradient(135deg, rgba(39, 191, 36, 0.14), rgba(255, 159, 26, 0.16));
    }

    :global(body.app-theme-dark) .badge-chip {
        background: rgba(84, 214, 98, 0.16);
        color: #cbffcb;
    }

    @media (max-width: 900px) {
        .overview-grid,
        .two-col,
        .project-grid {
            grid-template-columns: 1fr;
        }
    }

    @media (max-width: 680px) {
        .hero-card {
            flex-direction: column;
        }
    }
</style>
