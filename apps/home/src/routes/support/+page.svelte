<svelte:head>
    <title>Support DevCore</title>
</svelte:head>

<main class="info-page">
    <div class="info-card">
        <p class="eyebrow">DevCore</p>
        <h1>Support DevCore</h1>
        <p>
            DevCore is being assembled from the wider PenguinMod ecosystem, so support options are
            still being unified.
        </p>
        <p>
            The easiest ways to help right now are to share feedback, report issues, and support the
            upstream tools that made this stack possible.
        </p>
        <div class="link-list">
            <a href="https://github.com/PenguinMod/">PenguinMod GitHub</a>
            <a href="https://github.com/sponsors/GarboMuffin">Support TurboWarp</a>
            <a href="https://www.scratchfoundation.org/donate">Support Scratch Foundation</a>
            <a href="https://discord.gg/NZ9MBMYTZh">Join the community Discord</a>
        </div>
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
    .link-list {
        display: grid;
        gap: 0.75rem;
        margin-top: 1.25rem;
    }
    a {
        color: var(--devcore-topbar, #00c3ff);
        font-weight: 700;
    }
    :global(body.app-theme-dark) .info-card {
        background: rgba(17, 17, 17, 0.88);
    }
</style>
