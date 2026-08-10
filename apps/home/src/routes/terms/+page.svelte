<svelte:head>
    <title>DevCore Terms</title>
</svelte:head>

<script>
    import { DEVCORE_CREDITS_PATH } from "$lib/resources/site-paths";
</script>

<main class="info-page">
    <div class="info-card">
        <p class="eyebrow">DevCore</p>
        <h1>Terms of Service</h1>
        <p>
            DevCore is still consolidating the wider PenguinMod stack into one hosted platform,
            but this route now stays inside the owned DevCore home app instead of handing people
            back to the editor bundle.
        </p>
        <p>
            By using DevCore, you agree not to upload or share abusive, unlawful, or infringing
            content, and you agree to follow the community and uploading guidelines that govern the
            shared project ecosystem.
        </p>
        <p>
            You are also responsible for the safety and accuracy of the information you provide
            while account, project, and moderation systems continue moving under one DevCore-owned
            deployment.
        </p>
        <p>
            For the current community policy references, use the
            <a href="/guidelines/uploading">uploading guidelines</a>, the
            <a href="/privacy">privacy policy</a>, and
            <a href="/contact">contact page</a>.
            Credit and contributor details are available at
            <a href={DEVCORE_CREDITS_PATH}>the DevCore credits page</a>.
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
    }
    a {
        color: var(--devcore-topbar, #27bf24);
        font-weight: 700;
    }
    :global(body.app-theme-dark) .info-card {
        background: rgba(17, 17, 17, 0.88);
    }
</style>
