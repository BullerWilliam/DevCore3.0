<script>
    import UserData from "../../../../editor/src/playground/credits/users.js";

    import externalLinks from "$lib/resources/external-links";

    const normalizeCreditsLink = href => {
        if (!href) return "/credits";

        const normalizedHref = `${href}`.trim();
        if (!normalizedHref) return "/credits";

        try {
            const url = new URL(normalizedHref);
            const host = url.hostname.toLowerCase();

            if (host.endsWith("penguinmod.com")) {
                if (url.pathname === "/support") return "/support";
                if (url.pathname === "/credits.html") return "/credits";
                if (url.pathname === "/profile" && url.searchParams.get("user")) {
                    return `/profile?user=${encodeURIComponent(url.searchParams.get("user"))}`;
                }
            }

            if (host === "studio.penguinmod.com" && url.pathname === "/credits.html") {
                return "/credits";
            }
        } catch {
            return normalizedHref;
        }

        return normalizedHref;
    };

    const normalizeUserList = users => (users || []).map(user => ({
        ...user,
        href: normalizeCreditsLink(user.href),
    }));

    const creditsSections = [
        {
            title: "DevCore Team",
            description: "The people carrying the core DevCore fork forward from the PenguinMod stack.",
            users: normalizeUserList(UserData.pmDevelopers),
        },
        {
            title: "Supporters",
            description: "Community members helping keep the project alive while the unified platform is still being assembled.",
            users: normalizeUserList(UserData.pmSupporters),
            golden: true,
        },
        {
            title: "Merged Contributors",
            description: "People whose pull requests or shipped contributions made it into the shared DevCore lineage.",
            users: normalizeUserList(UserData.pmPullRequestDevelopers),
        },
        {
            title: "Backend Contributors",
            description: "Maintainers behind the project-sharing and account-side server work inherited from the PenguinMod ecosystem.",
            users: normalizeUserList(UserData.pmApiDevelopers),
        },
        {
            title: "Extension Authors",
            description: "Open-source extension authors whose work powers the DevCore and PenguinMod editor ecosystem.",
            users: normalizeUserList(UserData.extensionDevelopers),
        },
        {
            title: "DevCore Extension Contributors",
            description: "People who added or shipped extension work specifically through the PenguinMod and DevCore side of the stack.",
            users: normalizeUserList(UserData.pmExtensionDevelopers),
        },
        {
            title: "Addon Authors",
            description: "Scratch Addons authors whose work influenced the addon experience available in this codebase.",
            users: normalizeUserList(UserData.addonDevelopers),
        },
        {
            title: "Translators",
            description: "Community translators helping the DevCore lineage reach more people across more languages.",
            users: normalizeUserList(UserData.pmTranslators),
        },
        {
            title: "Costume Contributors",
            description: "People credited for costume and art assets carried through the shared editor libraries.",
            users: normalizeUserList(UserData.pmCostumeSubmittors),
        },
        {
            title: "Sound Contributors",
            description: "People credited for sound and audio assets used across the inherited library stack.",
            users: normalizeUserList(UserData.pmSoundSubmittors),
        },
        {
            title: "Open-Source Foundations",
            description: "Projects whose code or ideas directly shaped the current DevCore platform.",
            users: normalizeUserList(UserData.pmCodeUsedFrom),
        },
    ];

    const appreciationLinks = [
        {
            label: "Scratch",
            href: externalLinks.scratch,
            copy: "Scratch provided the original creative platform and community roots that made this entire family tree possible.",
        },
        {
            label: "TurboWarp",
            href: externalLinks.turbowarp,
            copy: "TurboWarp pushed the editor and runtime much further, and PenguinMod built directly on that momentum.",
        },
        {
            label: "PenguinMod",
            href: externalLinks.penguinmod,
            copy: "DevCore is a mod of PenguinMod, which remains the direct upstream public experience we are folding into this single-hosted stack.",
        },
    ];
</script>

<svelte:head>
    <title>DevCore Credits</title>
</svelte:head>

<main class="credits-page">
    <section class="hero-card">
        <p class="eyebrow">DevCore Credits</p>
        <h1>DevCore is a mod of PenguinMod, which is a mod of TurboWarp, which is a mod of Scratch.</h1>
        <p>
            This route brings contributor and lineage credits into the owned DevCore home app
            instead of relying on the editor bundle's legacy credits page.
        </p>
        <p>
            The contributor lists below are sourced from the imported PenguinMod credits data already
            living in this monorepo, with DevCore links normalized where this unified app has an
            owned route.
        </p>
    </section>

    <section class="panel-grid">
        {#each appreciationLinks as item}
            <article class="mini-card">
                <h2>{item.label}</h2>
                <p>{item.copy}</p>
                <a href={item.href} target="_blank" rel="noreferrer">Visit {item.label}</a>
            </article>
        {/each}
    </section>

    {#each creditsSections as section}
        <section class="info-card">
            <div class="section-head">
                <div>
                    <h2>{section.title}</h2>
                    <p>{section.description}</p>
                </div>
                <p>{section.users.length} credited people or projects</p>
            </div>

            <div class:users-golden={section.golden} class="user-grid">
                {#each section.users as user}
                    <a
                        class="user-card"
                        href={user.href}
                        target={user.href.startsWith("/") ? undefined : "_blank"}
                        rel={user.href.startsWith("/") ? undefined : "noreferrer"}
                    >
                        <img
                            class="user-avatar"
                            src={user.image}
                            alt={user.text}
                            loading="lazy"
                        />
                        <span>{user.text}</span>
                    </a>
                {/each}
            </div>
        </section>
    {/each}

    <section class="info-card">
        <h2>Support the Upstream Roots</h2>
        <p>
            DevCore still stands on the work of the wider Scratch, TurboWarp, and PenguinMod
            communities. If you want to support the broader ecosystem while this unified DevCore
            stack keeps taking shape, these are the most direct routes.
        </p>
        <div class="link-row">
            <a href="/support">Support DevCore</a>
            <a href="https://www.scratchfoundation.org/donate" target="_blank" rel="noreferrer">Support Scratch Foundation</a>
            <a href="https://github.com/sponsors/GarboMuffin" target="_blank" rel="noreferrer">Support TurboWarp</a>
            <a href="https://github.com/PenguinMod" target="_blank" rel="noreferrer">PenguinMod GitHub</a>
        </div>
    </section>
</main>

<style>
    .credits-page {
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
    .panel-grid,
    .info-card {
        width: min(74rem, 100%);
    }

    .hero-card,
    .info-card,
    .mini-card {
        border-radius: 1.25rem;
        background: rgba(255, 255, 255, 0.88);
        box-shadow: 0 20px 45px rgba(10, 26, 40, 0.12);
    }

    .hero-card,
    .info-card {
        padding: 1.5rem;
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
    h2 {
        margin-top: 0;
    }

    h1 {
        margin: 0.35rem 0 0.85rem;
        max-width: 60rem;
    }

    .panel-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 1rem;
    }

    .mini-card {
        padding: 1.1rem;
    }

    .section-head {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: baseline;
        margin-bottom: 1rem;
    }

    .section-head h2,
    .section-head p {
        margin-bottom: 0;
    }

    .user-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
        gap: 0.8rem;
    }

    .user-card {
        display: flex;
        align-items: center;
        gap: 0.9rem;
        padding: 0.8rem 0.9rem;
        border-radius: 1rem;
        background: rgba(39, 191, 36, 0.06);
        border: 1px solid rgba(39, 191, 36, 0.12);
        color: inherit;
        text-decoration: none;
        font-weight: 700;
        overflow-wrap: anywhere;
        transition: transform 0.12s ease, box-shadow 0.12s ease;
    }

    .user-card:hover {
        transform: translateY(-1px);
        box-shadow: 0 14px 24px rgba(10, 26, 40, 0.08);
    }

    .user-avatar {
        width: 3.4rem;
        height: 3.4rem;
        flex-shrink: 0;
        object-fit: cover;
        border-radius: 0.9rem;
        background: rgba(16, 82, 20, 0.08);
    }

    .users-golden .user-card {
        color: #6a3d00;
        border-color: rgba(255, 196, 0, 0.22);
        background:
            linear-gradient(
                145deg,
                rgba(255, 196, 0, 0.9) 0%,
                rgba(255, 196, 0, 0.9) 45%,
                rgba(255, 255, 255, 0.95) 50%,
                rgba(255, 196, 0, 0.9) 54%,
                rgba(255, 196, 0, 0.9) 100%
            );
        background-size: 300% 300%;
        animation: credit-shimmer 3s ease infinite;
    }

    .link-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.8rem 1rem;
        margin-top: 1rem;
    }

    a {
        color: var(--devcore-topbar, #27bf24);
    }

    @keyframes credit-shimmer {
        0% {
            background-position: 0% 0%;
        }

        100% {
            background-position: 100% 100%;
        }
    }

    :global(body.app-theme-dark) .credits-page {
        background:
            radial-gradient(circle at top left, rgba(39, 191, 36, 0.16), transparent 28rem),
            linear-gradient(180deg, rgba(255, 159, 26, 0.07), transparent 24rem),
            #111;
    }

    :global(body.app-theme-dark) .hero-card,
    :global(body.app-theme-dark) .info-card,
    :global(body.app-theme-dark) .mini-card {
        background: rgba(17, 17, 17, 0.9);
        box-shadow: 0 20px 45px rgba(0, 0, 0, 0.35);
    }

    :global(body.app-theme-dark) .hero-card {
        background:
            linear-gradient(135deg, rgba(39, 191, 36, 0.18), rgba(17, 17, 17, 0.94)),
            rgba(17, 17, 17, 0.9);
    }

    :global(body.app-theme-dark) .user-card {
        background: rgba(27, 31, 27, 0.96);
        border-color: rgba(84, 214, 98, 0.18);
        color: #f3fff1;
    }

    :global(body.app-theme-dark) .users-golden .user-card {
        color: #2c2200;
    }

    @media (max-width: 900px) {
        .panel-grid {
            grid-template-columns: 1fr;
        }

        .section-head {
            flex-direction: column;
            align-items: flex-start;
        }
    }
</style>
