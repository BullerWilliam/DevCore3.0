<svelte:head>
    <title>Contact DevCore</title>
</svelte:head>

<script>
    import externalLinks from "$lib/resources/external-links";
</script>

<main class="contact-page">
    <section class="hero-card">
        <p class="eyebrow">Contact DevCore</p>
        <h1>Reach the DevCore team</h1>
        <p>
            Please only contact the team directly for serious matters such as security,
            copyright, account recovery, or moderation issues that should not be handled in
            public.
        </p>
        <p>
            Spam, advertising, or unrelated mail may be ignored or blocked while the unified
            DevCore platform is still being assembled.
        </p>
    </section>

    <section class="panel-grid">
        <article class="info-card">
            <h2>Email</h2>
            <p>
                The current support inbox is still inherited from the PenguinMod support flow
                while the DevCore account and project systems are being folded into one stack.
            </p>
            <a href="mailto:penguinmodhelp@gmail.com">penguinmodhelp@gmail.com</a>
        </article>

        <article class="info-card">
            <h2>Issues</h2>
            <p>
                If the problem is reproducible or product-related, opening a GitHub issue is the
                fastest way to get it tracked.
            </p>
            <a href={externalLinks.issues} target="_blank" rel="noreferrer">Open DevCore issues</a>
        </article>

        <article class="info-card">
            <h2>Community</h2>
            <p>
                For general help, feedback, and follow-up discussion, the community Discord is
                still the best live channel.
            </p>
            <a href={externalLinks.discord} target="_blank" rel="noreferrer">Join the Discord server</a>
        </article>

        <article class="info-card">
            <h2>Support Routes</h2>
            <p>
                If you are not sure where to start, these owned DevCore routes usually answer the
                most common questions first.
            </p>
            <div class="link-column">
                <a href="/support">Open support options</a>
                <a href="/privacy">Read privacy policy</a>
                <a href="/terms">Read terms of service</a>
                <a href="/guidelines/uploading">Read uploading guidelines</a>
            </div>
        </article>
    </section>
</main>

<style>
    .contact-page {
        min-height: calc(100vh - 3rem);
        padding: 4rem 1.5rem 3rem;
        background:
            radial-gradient(circle at top left, rgba(39, 191, 36, 0.2), transparent 28rem),
            linear-gradient(180deg, rgba(255, 159, 26, 0.08), transparent 24rem),
            #f7fbf6;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.25rem;
    }

    .hero-card,
    .panel-grid {
        width: min(70rem, 100%);
    }

    .hero-card,
    .info-card {
        border-radius: 1.25rem;
        background: rgba(255, 255, 255, 0.88);
        box-shadow: 0 20px 45px rgba(10, 26, 40, 0.12);
    }

    .hero-card {
        padding: 1.6rem;
        line-height: 1.65;
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
        margin: 0.4rem 0 0.9rem;
        font-size: clamp(2rem, 5vw, 3.3rem);
        line-height: 1.05;
    }

    .panel-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
        gap: 1rem;
    }

    .info-card {
        padding: 1.25rem;
        line-height: 1.6;
    }

    .info-card h2 {
        margin: 0 0 0.65rem;
        font-size: 1.1rem;
    }

    a {
        color: var(--devcore-topbar, #27bf24);
        font-weight: 700;
        text-decoration: none;
    }

    a:hover {
        text-decoration: underline;
    }

    .link-column {
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
    }

    :global(body.app-theme-dark) .contact-page {
        background:
            radial-gradient(circle at top left, rgba(39, 191, 36, 0.24), transparent 28rem),
            linear-gradient(180deg, rgba(255, 159, 26, 0.12), transparent 24rem),
            #101312;
    }

    :global(body.app-theme-dark) .hero-card,
    :global(body.app-theme-dark) .info-card {
        background: rgba(17, 17, 17, 0.9);
        box-shadow: 0 20px 45px rgba(0, 0, 0, 0.28);
    }

    :global(body.app-theme-dark) a {
        color: #71df6d;
    }
</style>
