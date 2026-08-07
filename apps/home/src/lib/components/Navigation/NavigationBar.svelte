<script>
    import { onMount } from "svelte";
    import {
        DEFAULT_DEVCORE_THEME,
        applyDevcoreTheme,
        readStoredDevcoreTheme,
        subscribeToDevcoreTheme,
        writeStoredDevcoreTheme
    } from "@devcore/theme";
    import { PUBLIC_STUDIO_URL } from "$lib/resources/public-env";
    import { DEVCORE_EDITOR_PATH } from "$lib/resources/site-paths";

    import Icon from "$lib/components/Icon/Component.svelte";
    import LocalizedString from "$lib/components/Localization/LocalizedString.svelte";
    import LocalizedTooltip from "$lib/components/Localization/LocalizedTooltip.svelte.js";

    import TranslationMapper from "$lib/resources/localization/translation/mapper";
    import Authenticator from "$lib/resources/penguinmod/authentication/authenticator.js";

    import StateApplication from "$lib/state/app.svelte";
    import StoreSettings from "$lib/stores/settings";
    import StoreSession from "$lib/stores/session";

    const optionThemeToggle = () => {
        $StoreSettings.appTheme = $StoreSettings.appTheme === "light" ? "dark" : "light";
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();
    };

    const handleLogout = async () => {
        await Authenticator.logout();
    };

    const searchPlaceholder = () => TranslationMapper.mapCurrent("navigation.search", "Search for projects...");
    const profileHref = () => `/profile?user=${encodeURIComponent($StoreSession.userCachedUsername || "")}`;

    let themeEditorOpen = $state(false);
    let devcoreTheme = $state({ ...DEFAULT_DEVCORE_THEME });

    const updateDevcoreTheme = (key, value) => {
        devcoreTheme = {
            ...devcoreTheme,
            [key]: value
        };
        applyDevcoreTheme(writeStoredDevcoreTheme(devcoreTheme));
    };

    const resetDevcoreTheme = () => {
        devcoreTheme = { ...DEFAULT_DEVCORE_THEME };
        applyDevcoreTheme(writeStoredDevcoreTheme(devcoreTheme));
    };

    onMount(() => {
        devcoreTheme = readStoredDevcoreTheme();
        applyDevcoreTheme(devcoreTheme);
        return subscribeToDevcoreTheme((nextTheme) => {
            devcoreTheme = nextTheme;
            applyDevcoreTheme(nextTheme);
        });
    });
</script>

<div class="navigation-shell">
    <div class="navigation-bar">
        <div class="navigation-cluster navigation-cluster-left">
            {#if StateApplication.loggedInProcessed && $StoreSettings.loggedIn}
                <a class="navigation-text-link" href={profileHref()}>
                    <LocalizedString
                        text="Profile"
                        key="navigation.profile"
                    />
                </a>
                <a class="navigation-text-link" href="/mystuff">
                    <LocalizedString
                        text="My Stuff"
                        key="navigation.mystuff"
                    />
                </a>
                <a class="navigation-text-link" href="/settings">
                    <LocalizedString
                        text="Settings"
                        key="account.settings.title"
                    />
                </a>
                <button
                    class="navigation-text-button"
                    onclick={handleLogout}
                >
                    <LocalizedString
                        text="Logout"
                        key="navigation.logout"
                    />
                </button>
            {/if}
        </div>

        <div class="navigation-cluster navigation-cluster-center">
            <button
                class="navigation-icon-button"
                onclick={optionThemeToggle}
                {@attach LocalizedTooltip("navigation.theme")}
            >
                <Icon filled={$StoreSettings.appTheme !== "light"}>dark_mode</Icon>
            </button>

            <a
                href={DEVCORE_EDITOR_PATH}
                class="navigation-create-link"
                {@attach LocalizedTooltip("navigation.create")}
            >
                <img
                    class="navigation-create-icon"
                    src="/devcore-icon.png"
                    alt="DevCore"
                />
                <span>
                    <LocalizedString
                        text="Create"
                        key="navigation.create"
                    />
                </span>
            </a>

            <a class="navigation-home-link" href="/">
                <img
                    class="navigation-home-icon"
                    src="/devcore-icon.png"
                    alt="DevCore"
                />
            </a>

            <form class="navigation-search" onsubmit={handleSearchSubmit}>
                <Icon>search</Icon>
                <input
                    type="search"
                    placeholder={searchPlaceholder()}
                    aria-label={searchPlaceholder()}
                />
            </form>
        </div>

        <div class="navigation-cluster navigation-cluster-right">
            {#if StateApplication.loggedInProcessed && !($StoreSettings.loggedIn)}
                <a
                    href={PUBLIC_STUDIO_URL}
                    class="navigation-auth-link"
                    {@attach LocalizedTooltip("navigation.login")}
                >
                    <LocalizedString
                        text="Sign in"
                        key="navigation.login"
                    />
                </a>
                <a
                    href={PUBLIC_STUDIO_URL}
                    class="navigation-auth-link"
                    {@attach LocalizedTooltip("navigation.signup")}
                >
                    <LocalizedString
                        text="Sign up"
                        key="navigation.signup"
                    />
                </a>
            {:else if StateApplication.loggedInProcessed && $StoreSettings.loggedIn}
                <a
                    href="/settings"
                    class="navigation-icon-button-link"
                    {@attach LocalizedTooltip("account.settings.title")}
                >
                    <span class="navigation-icon-button">
                        <Icon>settings</Icon>
                    </span>
                </a>
            {/if}

            <button
                class="navigation-language-button"
                {@attach LocalizedTooltip("navigation.language")}
            >
                <Icon>language</Icon>
                <Icon>expand_more</Icon>
            </button>

            <button
                class="navigation-icon-button"
                onclick={() => themeEditorOpen = !themeEditorOpen}
                title="Customize DevCore colors"
            >
                <Icon>palette</Icon>
            </button>
        </div>
    </div>

    {#if themeEditorOpen}
        <div class="devcore-theme-panel">
            <div class="devcore-theme-panel-header">
                <strong>DevCore Theme</strong>
                <button class="navigation-text-button mini-button" onclick={resetDevcoreTheme}>
                    Reset
                </button>
            </div>

            <label class="devcore-theme-field">
                <span>Top bar</span>
                <input
                    type="color"
                    value={devcoreTheme.topBar}
                    oninput={(event) => updateDevcoreTheme("topBar", event.currentTarget.value)}
                />
            </label>

            <label class="devcore-theme-field">
                <span>Top bar text</span>
                <input
                    type="color"
                    value={devcoreTheme.topBarText}
                    oninput={(event) => updateDevcoreTheme("topBarText", event.currentTarget.value)}
                />
            </label>

            <label class="devcore-theme-field">
                <span>Accent</span>
                <input
                    type="color"
                    value={devcoreTheme.accent}
                    oninput={(event) => updateDevcoreTheme("accent", event.currentTarget.value)}
                />
            </label>
        </div>
    {/if}
</div>

<style>
    .navigation-shell {
        position: fixed;
        inset: 0 0 auto 0;
        z-index: 99999;
        overflow: visible;
    }

    .navigation-bar {
        min-height: 3rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        padding: 0 0.75rem;
        background: var(--devcore-topbar, #00c3ff);
        color: var(--devcore-topbar-text, white);
        box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.12);
    }

    .navigation-cluster {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    .navigation-cluster-left,
    .navigation-cluster-right {
        flex: 1 1 0;
    }

    .navigation-cluster-right {
        justify-content: flex-end;
    }

    .navigation-cluster-center {
        flex: 1.4 1 32rem;
        justify-content: center;
        gap: 0.5rem;
    }

    .navigation-text-link,
    .navigation-auth-link,
    .navigation-text-button,
    .navigation-create-link,
    .navigation-home-link,
    .navigation-icon-button,
    .navigation-language-button,
    .navigation-icon-button-link {
        color: var(--devcore-topbar-text, white);
        font-size: 0.86rem;
        font-weight: 700;
        text-decoration: none;
    }

    .navigation-text-link,
    .navigation-auth-link,
    .navigation-text-button {
        height: 2rem;
        padding: 0 0.75rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 0;
        border-radius: 999px;
        background: transparent;
        cursor: pointer;
        white-space: nowrap;
    }

    .navigation-icon-button,
    .navigation-language-button {
        height: 2rem;
        padding: 0 0.75rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.25rem;
        border: 0;
        border-radius: 999px;
        background: transparent;
        cursor: pointer;
    }

    .navigation-icon-button-link {
        display: inline-flex;
    }

    .navigation-create-link {
        height: 2.25rem;
        padding: 0 0.9rem 0 0.5rem;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.16);
        white-space: nowrap;
    }

    .navigation-create-icon,
    .navigation-home-icon {
        width: 1.6rem;
        height: 1.6rem;
        object-fit: contain;
        border-radius: 999px;
        background: white;
    }

    .navigation-home-link {
        width: 2.25rem;
        height: 2.25rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.16);
    }

    .navigation-search {
        flex: 1 1 18rem;
        max-width: 28rem;
        height: 2.25rem;
        padding: 0 0.8rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.96);
        color: #3f4a56;
        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
    }

    .navigation-search input {
        width: 100%;
        min-width: 0;
        border: 0;
        outline: 0;
        background: transparent;
        color: #3f4a56;
        font-size: 0.9rem;
        font-weight: 600;
    }

    .navigation-search :global(span) {
        color: #5d6a76;
        font-size: 1.15rem;
    }

    .navigation-text-link:hover,
    .navigation-auth-link:hover,
    .navigation-text-button:hover,
    .navigation-icon-button:hover,
    .navigation-language-button:hover,
    .navigation-create-link:hover,
    .navigation-home-link:hover {
        background: rgba(0, 0, 0, 0.11);
    }

    .navigation-search:focus-within {
        box-shadow: inset 0 0 0 2px rgba(0, 195, 255, 0.28);
    }

    .devcore-theme-panel {
        position: absolute;
        top: calc(100% + 0.5rem);
        right: 0.75rem;
        width: min(18rem, calc(100vw - 1.5rem));
        padding: 0.85rem;
        background: rgba(14, 21, 32, 0.96);
        color: white;
        border-radius: 0.85rem;
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: grid;
        gap: 0.75rem;
    }

    .devcore-theme-panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
    }

    .devcore-theme-field {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        font-size: 0.85rem;
    }

    .devcore-theme-field input {
        width: 3rem;
        height: 2rem;
        border: none;
        background: transparent;
        padding: 0;
        cursor: pointer;
    }

    .mini-button {
        background: rgba(255, 255, 255, 0.12);
    }

    @media (max-width: 900px) {
        .navigation-bar {
            flex-wrap: wrap;
            justify-content: center;
            padding: 0.5rem 0.75rem;
        }

        .navigation-cluster-left,
        .navigation-cluster-center,
        .navigation-cluster-right {
            flex: 1 1 100%;
            justify-content: center;
        }

        .navigation-search {
            max-width: none;
        }
    }
</style>
