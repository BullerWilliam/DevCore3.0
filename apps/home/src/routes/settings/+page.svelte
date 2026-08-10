<script>
    import { browser } from "$app/environment";

    import { PUBLIC_STUDIO_URL } from "$lib/resources/public-env";
    import DevCorePublicProfileAPI from "$lib/resources/devcore/public-profile-api";
    import Authenticator from "$lib/resources/penguinmod/authentication/authenticator.js";
    import CacheHelper from "$lib/resources/cache/cache-helper.js";
    import Locale from "$lib/resources/localization/locale.js";
    import TranslationMapper from "$lib/resources/localization/translation/mapper";
    import languageInfo from "$lib/resources/localization/translation/language/language-info.js";

    import StoreSettings from "$lib/stores/settings.js";
    import StoreSession from "$lib/stores/session.js";

    const visibleLanguageCodes = languageInfo.languageOrder.filter(code => {
        return code && !languageInfo.languageJoke?.[code];
    });

    const formatDateTime = value => {
        if (!value) return "Not cached yet";
        return Locale.timestampToDateWithTime(value);
    };

    const readableLanguageName = code => {
        return languageInfo.languageName?.[code] || code;
    };

    const readableRoleList = session => {
        const roles = [];
        if (session.userCachedSupporter) roles.push("Supporter");
        if (session.userCachedMod) roles.push("Moderator");
        if (session.userCachedAdmin) roles.push("Admin");
        if (roles.length === 0) roles.push("Community member");
        return roles;
    };

    let mirroredProfile = $state(null);
    let mirroredProfileLoading = $state(false);
    let mirroredProfileError = $state(null);
    let actionMessage = $state("");
    let actionMessageTone = $state("neutral");

    const signedIn = $derived(Boolean($StoreSettings.loggedIn));
    const effectiveLanguageCode = $derived(TranslationMapper.mapSavedLanguageCode($StoreSettings.appLanguage));
    const browserLanguageCode = $derived(TranslationMapper.mapLanguageCode(Locale.browserLanguage || "en-US"));
    const languageSummary = $derived(
        $StoreSettings.appLanguage === "browser"
            ? `Browser default (${readableLanguageName(browserLanguageCode)})`
            : readableLanguageName(effectiveLanguageCode)
    );
    const accountUsername = $derived($StoreSession.userCachedUsername || "");
    const accountDisplayName = $derived($StoreSession.userCachedDisplayName || "Guest");
    const accountRoles = $derived(readableRoleList($StoreSession));
    const overviewStats = $derived([
        {
            label: "Theme",
            value: $StoreSettings.appTheme === "dark" ? "Dark" : "Light",
        },
        {
            label: "Language",
            value: languageSummary,
        },
        {
            label: "Account mode",
            value: signedIn ? "Signed in" : "Guest",
        },
        {
            label: "Owned profile mirror",
            value: !signedIn
                ? "Guest mode"
                : mirroredProfileLoading
                    ? "Checking..."
                    : mirroredProfile
                        ? `${mirroredProfile.projectCount || 0} projects mirrored`
                        : "Not mirrored yet",
        },
    ]);

    const setActionMessage = (message, tone = "neutral") => {
        actionMessage = message;
        actionMessageTone = tone;
    };

    const updateTheme = theme => {
        StoreSettings.update(current => ({
            ...current,
            appTheme: theme === "dark" ? "dark" : "light",
        }));
        setActionMessage(`Theme updated to ${theme === "dark" ? "dark" : "light"} mode.`, "success");
    };

    const updateLanguage = event => {
        const nextLanguage = event.currentTarget.value;
        StoreSettings.update(current => ({
            ...current,
            appLanguage: nextLanguage === "browser"
                ? "browser"
                : TranslationMapper.mapLanguageCode(nextLanguage),
        }));
        setActionMessage(
            nextLanguage === "browser"
                ? "Language now follows your browser setting."
                : `Language updated to ${readableLanguageName(TranslationMapper.mapLanguageCode(nextLanguage))}.`,
            "success"
        );
    };

    const clearDismissedAlerts = () => {
        StoreSettings.update(current => ({
            ...current,
            alertDismissed: [],
            alertStatusDismissed: [],
        }));
        setActionMessage("Dismissed homepage alerts were reset for this browser.", "success");
    };

    const clearSessionCache = () => {
        CacheHelper.reset();
        setActionMessage("Local session caches were cleared. The page will repopulate them as needed.", "success");
    };

    const handleLogout = async () => {
        try {
            await Authenticator.logout();
            mirroredProfile = null;
            setActionMessage("Logged out of the local DevCore session.", "success");
        } catch (error) {
            console.error(error);
            setActionMessage("Logout could not be completed right now.", "error");
        }
    };

    $effect(async () => {
        if (!browser) return;

        const username = $StoreSession.userCachedUsername;
        const canLoadMirror = Boolean($StoreSettings.loggedIn && username);

        if (!canLoadMirror) {
            mirroredProfile = null;
            mirroredProfileError = null;
            mirroredProfileLoading = false;
            return;
        }

        mirroredProfileLoading = true;
        mirroredProfileError = null;

        try {
            mirroredProfile = await DevCorePublicProfileAPI.getProfile(username);
        } catch (error) {
            console.error(error);
            mirroredProfile = null;
            mirroredProfileError = error;
        } finally {
            mirroredProfileLoading = false;
        }
    });
</script>

<svelte:head>
    <title>DevCore Settings</title>
</svelte:head>

<main class="settings-page">
    <section class="hero-card">
        <div class="hero-badge">DC</div>
        <div class="hero-copy">
            <p class="eyebrow">DevCore Settings</p>
            <h1>Own your local DevCore experience</h1>
            <p>
                This settings surface now lives inside the unified DevCore home app, so theme,
                language, local account cache behavior, and homepage alert state no longer need to
                bounce you out to an upstream placeholder page.
            </p>
            <p class="hero-note">
                Passwords, email controls, and deeper project-account management are still part of
                the larger backend migration.
            </p>
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

    {#if actionMessage}
        <section class={`status-card tone-${actionMessageTone}`}>
            <p>{actionMessage}</p>
        </section>
    {/if}

    <section class="settings-grid">
        <article class="info-card">
            <div class="section-head">
                <div>
                    <p class="eyebrow">Appearance</p>
                    <h2>Theme</h2>
                </div>
            </div>
            <p>
                Pick the local DevCore theme used across the home app and shared navigation shell.
            </p>
            <div class="choice-row">
                <button
                    class:choice-active={$StoreSettings.appTheme === "light"}
                    class="choice-button"
                    type="button"
                    onclick={() => updateTheme("light")}
                >
                    Light
                </button>
                <button
                    class:choice-active={$StoreSettings.appTheme === "dark"}
                    class="choice-button"
                    type="button"
                    onclick={() => updateTheme("dark")}
                >
                    Dark
                </button>
            </div>
        </article>

        <article class="info-card">
            <p class="eyebrow">Localization</p>
            <h2>Language</h2>
            <p>
                Choose a saved app language, or keep DevCore aligned with your browser preference.
            </p>
            <label class="field-label" for="settings-language">Display language</label>
            <select
                id="settings-language"
                class="settings-select"
                value={$StoreSettings.appLanguage}
                onchange={updateLanguage}
            >
                <option value="browser">
                    Browser default ({readableLanguageName(browserLanguageCode)})
                </option>
                {#each visibleLanguageCodes as languageCode}
                    <option value={languageCode}>
                        {readableLanguageName(languageCode)}
                    </option>
                {/each}
            </select>
            <p class="meta-note">
                Active language: {readableLanguageName(effectiveLanguageCode)}
            </p>
        </article>

        <article class="info-card">
            <p class="eyebrow">Account Snapshot</p>
            <h2>{signedIn ? accountDisplayName : "Guest session"}</h2>
            {#if signedIn}
                <p class="subcopy">@{accountUsername || "unknown"}</p>
                <div class="badge-row">
                    {#each accountRoles as role}
                        <span class="badge-chip">{role}</span>
                    {/each}
                </div>
                <div class="account-grid">
                    <div>
                        <p class="field-label">Unread messages</p>
                        <p class="field-value">{$StoreSession.userCachedUnreadCount || 0}</p>
                    </div>
                    <div>
                        <p class="field-label">Cached account refresh</p>
                        <p class="field-value">{formatDateTime($StoreSession.userCachedTime)}</p>
                    </div>
                    <div>
                        <p class="field-label">Owned mirrored profile</p>
                        <p class="field-value">
                            {#if mirroredProfileLoading}
                                Checking owned profile mirror...
                            {:else if mirroredProfile}
                                {mirroredProfile.projectCount || 0} projects mirrored
                            {:else if mirroredProfileError}
                                Mirror check unavailable right now
                            {:else}
                                No owned profile mirror found yet
                            {/if}
                        </p>
                    </div>
                </div>
                <div class="link-row">
                    <a href={`/profile?user=${encodeURIComponent(accountUsername)}`}>Open profile</a>
                    <a href="/mystuff">Open My Stuff</a>
                </div>
                <button class="action-button action-button-dark" type="button" onclick={handleLogout}>
                    Log out here
                </button>
            {:else}
                <p>
                    You are browsing the owned DevCore home app without a local signed-in session.
                </p>
                <p>
                    Upstream authentication still exists during the migration, so if you need the
                    current live account flow you can still
                    <a href={PUBLIC_STUDIO_URL}>open the DevCore studio</a>.
                </p>
            {/if}
        </article>

        <article class="info-card">
            <p class="eyebrow">Local Data</p>
            <h2>Cache and alert controls</h2>
            <p>
                These tools only touch local browser data owned by the unified DevCore app.
            </p>
            <div class="stacked-actions">
                <button class="action-button" type="button" onclick={clearDismissedAlerts}>
                    Reset dismissed homepage alerts
                </button>
                <button class="action-button" type="button" onclick={clearSessionCache}>
                    Clear local session caches
                </button>
            </div>
            <div class="account-grid">
                <div>
                    <p class="field-label">Status alert cache</p>
                    <p class="field-value">{formatDateTime($StoreSession.alertStatusCachedTime)}</p>
                </div>
                <div>
                    <p class="field-label">Homepage updates cache</p>
                    <p class="field-value">{formatDateTime($StoreSession.frontpageUpdatesCachedTime)}</p>
                </div>
                <div>
                    <p class="field-label">Homepage project rails cache</p>
                    <p class="field-value">{formatDateTime($StoreSession.frontpageProjectsCachedTime)}</p>
                </div>
            </div>
        </article>

        <article class="info-card info-card-wide">
            <div class="section-head">
                <div>
                    <p class="eyebrow">Migration Coverage</p>
                    <h2>What this page owns today</h2>
                </div>
                <a href="/dev-panel">Open dev panel</a>
            </div>
            <p>
                DevCore now owns this settings route inside the same deployment as the homepage,
                editor shell, packager, docs, extensions gallery, profile mirror, and read-only My
                Stuff workspace.
            </p>
            <p>
                The remaining work is deeper backend ownership: writable profiles, project
                management, password and email workflows, and admin editing for featured content and
                homepage news blocks.
            </p>
            <p class="meta-note">
                Need the old live path anyway?
                <a href={PUBLIC_STUDIO_URL}>Open the upstream studio settings flow</a>.
            </p>
        </article>
    </section>
</main>

<style>
    .settings-page {
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
    .overview-grid,
    .status-card,
    .settings-grid {
        width: min(72rem, 100%);
    }

    .hero-card,
    .status-card,
    .info-card,
    .mini-card {
        border-radius: 1.25rem;
        background: rgba(255, 255, 255, 0.84);
        box-shadow: 0 20px 45px rgba(10, 26, 40, 0.12);
    }

    .hero-card {
        padding: 1.5rem;
        display: flex;
        gap: 1.25rem;
        align-items: flex-start;
    }

    .hero-badge {
        width: 5rem;
        height: 5rem;
        flex-shrink: 0;
        border-radius: 1.45rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background:
            linear-gradient(135deg, rgba(39, 191, 36, 0.92), rgba(16, 151, 67, 0.96));
        color: white;
        font-size: 1.75rem;
        font-weight: 800;
        letter-spacing: 0.04em;
    }

    .hero-copy h1,
    .hero-copy p,
    .info-card h2 {
        margin-top: 0;
    }

    .hero-note,
    .subcopy,
    .meta-note {
        color: rgba(16, 35, 20, 0.72);
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
        margin: 0.35rem 0 0.75rem;
    }

    .overview-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 1rem;
    }

    .mini-card {
        padding: 1rem 1.1rem;
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
        color: rgba(16, 35, 20, 0.72);
    }

    .mini-value {
        margin-top: 0.35rem;
        font-size: 1.2rem;
        font-weight: 800;
        color: #0f3413;
    }

    .status-card {
        padding: 1rem 1.25rem;
        line-height: 1.5;
    }

    .status-card p {
        margin: 0;
    }

    .tone-success {
        border: 1px solid rgba(39, 191, 36, 0.24);
        background: rgba(244, 255, 243, 0.92);
    }

    .tone-error {
        border: 1px solid rgba(205, 47, 47, 0.2);
        background: rgba(255, 244, 244, 0.92);
    }

    .settings-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
    }

    .info-card {
        padding: 1.5rem;
        line-height: 1.6;
    }

    .info-card-wide {
        grid-column: 1 / -1;
    }

    .section-head {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: baseline;
    }

    .choice-row,
    .badge-row,
    .link-row,
    .stacked-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
    }

    .stacked-actions {
        flex-direction: column;
        align-items: flex-start;
    }

    .choice-button,
    .action-button,
    .settings-select {
        border-radius: 0.9rem;
        border: 1px solid rgba(39, 191, 36, 0.18);
        font: inherit;
    }

    .choice-button,
    .action-button {
        padding: 0.75rem 1rem;
        font-weight: 700;
        cursor: pointer;
        background: rgba(247, 251, 247, 0.96);
        color: #12311a;
        transition: transform 0.12s ease, box-shadow 0.12s ease;
    }

    .choice-button:hover,
    .action-button:hover {
        transform: translateY(-1px);
        box-shadow: 0 14px 24px rgba(10, 26, 40, 0.08);
    }

    .choice-active {
        background:
            linear-gradient(135deg, rgba(39, 191, 36, 0.14), rgba(255, 159, 26, 0.12));
        border-color: rgba(39, 191, 36, 0.34);
    }

    .action-button-dark {
        background: rgba(19, 41, 24, 0.96);
        color: white;
        border-color: rgba(19, 41, 24, 0.96);
    }

    .settings-select {
        width: 100%;
        margin-top: 0.4rem;
        padding: 0.85rem 0.95rem;
        background: rgba(255, 255, 255, 0.94);
        color: inherit;
    }

    .field-label,
    .field-value {
        margin: 0;
    }

    .field-label {
        font-size: 0.82rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: rgba(16, 35, 20, 0.72);
    }

    .field-value {
        margin-top: 0.25rem;
        font-weight: 700;
    }

    .account-grid {
        margin: 1rem 0;
        display: grid;
        grid-template-columns: 1fr;
        gap: 0.85rem;
    }

    .badge-chip {
        padding: 0.45rem 0.8rem;
        border-radius: 999px;
        background: rgba(39, 191, 36, 0.12);
        color: #167326;
        font-size: 0.9rem;
        font-weight: 700;
    }

    a {
        color: var(--devcore-topbar, #27bf24);
        font-weight: 700;
    }

    :global(body.app-theme-dark) .hero-card,
    :global(body.app-theme-dark) .status-card,
    :global(body.app-theme-dark) .info-card,
    :global(body.app-theme-dark) .mini-card {
        background: rgba(17, 17, 17, 0.88);
    }

    :global(body.app-theme-dark) .tone-success {
        background: rgba(18, 38, 20, 0.94);
        border-color: rgba(84, 214, 98, 0.22);
    }

    :global(body.app-theme-dark) .tone-error {
        background: rgba(53, 19, 19, 0.94);
        border-color: rgba(255, 117, 117, 0.2);
    }

    :global(body.app-theme-dark) .hero-note,
    :global(body.app-theme-dark) .subcopy,
    :global(body.app-theme-dark) .meta-note,
    :global(body.app-theme-dark) .mini-label,
    :global(body.app-theme-dark) .field-label {
        color: rgba(232, 255, 230, 0.72);
    }

    :global(body.app-theme-dark) .mini-value,
    :global(body.app-theme-dark) .field-value {
        color: #e8ffe6;
    }

    :global(body.app-theme-dark) .choice-button,
    :global(body.app-theme-dark) .action-button,
    :global(body.app-theme-dark) .settings-select {
        background: rgba(27, 31, 27, 0.96);
        color: #f3fff1;
        border-color: rgba(84, 214, 98, 0.18);
    }

    :global(body.app-theme-dark) .choice-active {
        background:
            linear-gradient(135deg, rgba(39, 191, 36, 0.2), rgba(255, 159, 26, 0.16));
        border-color: rgba(84, 214, 98, 0.28);
    }

    :global(body.app-theme-dark) .badge-chip {
        background: rgba(84, 214, 98, 0.16);
        color: #cbffcb;
    }

    @media (max-width: 980px) {
        .overview-grid,
        .settings-grid {
            grid-template-columns: 1fr;
        }
    }

    @media (max-width: 680px) {
        .hero-card {
            flex-direction: column;
        }

        .section-head {
            flex-direction: column;
            align-items: flex-start;
        }
    }
</style>
