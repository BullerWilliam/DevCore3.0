<script>
    import { browser } from "$app/environment";
    import { PUBLIC_STUDIO_URL } from "$lib/resources/public-env";

    const defaultUsername = "DevCore user";
    let username = $state(defaultUsername);
    let postId = $state(null);

    if (browser) {
        const params = new URLSearchParams(window.location.search);
        username = params.get("user") || defaultUsername;
        postId = params.get("post");
    }
</script>

<svelte:head>
    <title>{username} on DevCore</title>
</svelte:head>

<main class="info-page">
    <div class="info-card">
        <p class="eyebrow">DevCore</p>
        <h1>{username}</h1>
        <p>
            Public profiles are still part of the legacy studio while DevCore’s unified account
            surface is being assembled.
        </p>
        {#if postId}
            <p>
                A feed item linked you here from post <strong>{postId}</strong>. That content
                still lives in the studio-side account experience today.
            </p>
        {/if}
        <p>
            This bridge route keeps profile links from feed cards and home actions working instead
            of returning a 404.
        </p>
        <p>
            Continue in the studio here:
            <a href={PUBLIC_STUDIO_URL}>open the DevCore studio</a>.
        </p>
    </div>
</main>

<style>
    .info-page {
        min-height: calc(100vh - 3rem);
        padding: 5rem 1.5rem 3rem;
        background:
            radial-gradient(circle at top left, rgba(39, 191, 36, 0.18), transparent 28rem),
            linear-gradient(180deg, rgba(255, 159, 26, 0.08), transparent 24rem);
        display: flex;
        justify-content: center;
    }
    .info-card {
        width: min(44rem, 100%);
        padding: 1.5rem;
        border-radius: 1.25rem;
        background: rgba(255, 255, 255, 0.82);
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
    h1 {
        margin: 0.35rem 0 1rem;
        overflow-wrap: anywhere;
    }
    a {
        color: var(--devcore-topbar, #27bf24);
        font-weight: 700;
    }
    :global(body.app-theme-dark) .info-card {
        background: rgba(17, 17, 17, 0.88);
    }
</style>
