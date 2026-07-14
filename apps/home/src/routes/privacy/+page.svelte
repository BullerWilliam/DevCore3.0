<svelte:head>
    <title>DevCore Privacy</title>
</svelte:head>

<main class="info-page">
    <div class="info-card">
        <p class="eyebrow">DevCore</p>
        <h1>Privacy Policy</h1>
        <p>
            DevCore currently reuses several legacy hosted services for API and project data, while
            the public-facing site is being brought together under one repo and one deployment.
        </p>
        <p>
            The bundled legacy privacy document remains available here:
            <a href="/editor/privacy.html">open privacy policy</a>.
        </p>
        <p>
            As more services move directly into DevCore, this page is where the deployment-specific
            privacy details should be expanded.
        </p>
    </div>
</main>

<style>
    .info-page {
        min-height: calc(100vh - 3rem);
        padding: 5rem 1.5rem 3rem;
        background:
            radial-gradient(circle at top left, rgba(0, 195, 255, 0.18), transparent 28rem),
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
        color: var(--devcore-topbar, #00c3ff);
        font-size: 0.85rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }
    h1 {
        margin: 0.35rem 0 1rem;
    }
    a {
        color: var(--devcore-topbar, #00c3ff);
        font-weight: 700;
    }
    :global(body.app-theme-dark) .info-card {
        background: rgba(17, 17, 17, 0.88);
    }
</style>
