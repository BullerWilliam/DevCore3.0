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

    // Components
    import Icon from "$lib/components/Icon/Component.svelte";
    import LocalizedAlt from "$lib/components/Localization/LocalizedAlt.svelte.js";
    import LocalizedString from "$lib/components/Localization/LocalizedString.svelte";
    import LocalizedTooltip from "$lib/components/Localization/LocalizedTooltip.svelte.js";

    import StateApplication from "$lib/state/app.svelte";
    import StoreSettings from "$lib/stores/settings";
    import StoreSession from "$lib/stores/session";

    const optionThemeToggle = () => {
        $StoreSettings.appTheme = $StoreSettings.appTheme === "light" ? "dark" : "light";
    };

    let themeEditorOpen = $state(false);
    let devcoreTheme = $state({...DEFAULT_DEVCORE_THEME});

    const updateDevcoreTheme = (key, value) => {
        devcoreTheme = {
            ...devcoreTheme,
            [key]: value
        };
        applyDevcoreTheme(writeStoredDevcoreTheme(devcoreTheme));
    };

    const resetDevcoreTheme = () => {
        devcoreTheme = {...DEFAULT_DEVCORE_THEME};
        applyDevcoreTheme(writeStoredDevcoreTheme(devcoreTheme));
    };

    onMount(() => {
        devcoreTheme = readStoredDevcoreTheme();
        applyDevcoreTheme(devcoreTheme);
        return subscribeToDevcoreTheme(nextTheme => {
            devcoreTheme = nextTheme;
            applyDevcoreTheme(nextTheme);
        });
    });
</script>

<div class="navigation-bar">
    <div class="navigation-bar-section navigation-options">
        <!-- TODO: This should open a menu that shows a language picker -->
        <button
            class="navigation-button"
            {@attach LocalizedTooltip("navigation.language")}
        >
            <Icon>language</Icon>
        </button>
        <button
            class="navigation-button"
            onclick={optionThemeToggle}
            {@attach LocalizedTooltip("navigation.theme")}
        >
            <Icon filled={$StoreSettings.appTheme !== "light"}>dark_mode</Icon>
        </button>
        <button
            class="navigation-button"
            onclick={() => themeEditorOpen = !themeEditorOpen}
            title="Customize DevCore colors"
        >
            <Icon>palette</Icon>
        </button>
    </div>
    <div class="navigation-bar-section navigation-links">
        <a class="navigation-logo" href="/">
            <img
                class="navigation-logo-image"
                src="/favicon.svg"
                alt="DevCore"
            />
            <span class="navigation-logo-wordmark">DevCore</span>
        </a>

        <!-- generic links -->
        <a
            href={PUBLIC_STUDIO_URL}
            class="navigation-button-link"
            {@attach LocalizedTooltip("navigation.create")}
        >
            <button tabindex="-1">
                <LocalizedString
                    text="Create"
                    key="navigation.create"
                />
            </button>
        </a>

        <!-- TODO: Search bar should be here. Should probably be its own element if we want to attach autofill and stuff to it -->
        <!-- TODO: Add search suggestions like ext gallery, but they'll be like "Search for projects, search for users, etc" -->
        <!-- TODO: Add some autofill & standards in general for the selectors used in legacy home -->

        <!-- account buttons -->
        {#if StateApplication.loggedInProcessed && $StoreSettings.loggedIn}
            <!-- TODO: This should link to the messages tab -->
            <a
                href={PUBLIC_STUDIO_URL}
                class="navigation-button-link"
                {@attach LocalizedTooltip("messages.title")}
            >
                <button tabindex="-1">
                    <Icon>mail</Icon>
                </button>
            </a>
            <!-- TODO: This should link to the my stuff tab -->
            <a
                href={PUBLIC_STUDIO_URL}
                class="navigation-button-link"
                {@attach LocalizedTooltip("navigation.mystuff")}
            >
                <button tabindex="-1">
                    <Icon>folder</Icon>
                </button>
            </a>
            {#if $StoreSession.userCachedAdmin || $StoreSession.userCachedMod}
                <!-- TODO: This should link to the admin panell -->
                <!-- NOTE: We dont translate admin-only elements -->
                <a
                    href={PUBLIC_STUDIO_URL}
                    class="navigation-button-link"
                >
                    <button tabindex="-1">
                        <Icon>admin_panel_settings</Icon>
                    </button>
                </a>
            {/if}
        {/if}

        <!-- login buttons -->
        {#if StateApplication.loggedInProcessed && !($StoreSettings.loggedIn)}
            <!-- TODO: Link to the sign in page -->
            <!-- TODO: When redirecting to the sign in page, we should preserve ALL of the "referrer" URL. ALL of it. -->
            <a
                href={PUBLIC_STUDIO_URL}
                class="navigation-button-link"
                {@attach LocalizedTooltip("navigation.login")}
            >
                <button tabindex="-1">
                    <LocalizedString
                        text="Sign in"
                        key="navigation.login"
                    />
                </button>
            </a>
            <!-- TODO: Link to the sign up page -->
            <!-- TODO: When redirecting to the sign up page, we should preserve ALL of the "referrer" URL. ALL of it. -->
            <a
                href={PUBLIC_STUDIO_URL}
                class="navigation-button-link"
                {@attach LocalizedTooltip("navigation.signup")}
            >
                <button tabindex="-1">
                    <LocalizedString
                        text="Sign up"
                        key="navigation.signup"
                    />
                </button>
            </a>
        {/if}
    </div>
    <div class="navigation-bar-section navigation-others">
        <!-- events -->
        <!-- TODO: UNIMPORTANT: Test out filling this bar with multiple events later. -->
    </div>

    {#if themeEditorOpen}
        <div class="devcore-theme-panel">
            <div class="devcore-theme-panel-header">
                <strong>DevCore Theme</strong>
                <button class="navigation-button mini-button" onclick={resetDevcoreTheme}>
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
    .navigation-bar {
		position: fixed;
		left: 0;
		top: 0;
		width: 100%;
        height: 3rem;

		display: flex;
		flex-direction: row;
        justify-content: space-between;

        background: var(--devcore-topbar, #00c3ff);
        color: var(--devcore-topbar-text, white);
        overflow: visible;

        z-index: 99999;
    }
    .navigation-bar > * {
        margin: 0 2px;
    }
    .navigation-bar button {
        color: var(--devcore-topbar-text, white);
        font-weight: bold;
        font-size: .85rem;
    }
    .navigation-bar-section {
		display: flex;
		flex-wrap: nowrap;
		flex-direction: row;
		justify-content: center;
		align-items: center;
    }
    /* TODO: does this look good or does this look like Buns */
    :global(body.app-theme-dark) .navigation-bar {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .navigation-options,
    .navigation-others {
        width: 25%;
    }
    .navigation-options {
        justify-content: flex-start;
    }
    .navigation-others {
        justify-content: flex-end;
    }

    /* NOTE: Unlike legacy home, we intend on not shifting the entire UI on logo hover */
    .navigation-logo {
        width: 3rem;
		height: 3rem;
        margin: 0 4px;

		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
    }
    .navigation-logo-image {
        width: 85%;
		height: 85%;

        transition: 0.15s ease;
    }
    .navigation-logo-wordmark {
        font-size: .95rem;
        font-weight: 800;
        letter-spacing: .04em;
        color: var(--devcore-topbar-text, white);
    }
    .navigation-logo:hover .navigation-logo-image {
        width: 95%;
		height: 95%;

        transition: 0.15s ease;
    }

    .navigation-button,
    .navigation-button-link {
        height: calc(100% - 8px);
    }
    .navigation-button-link button {
        height: 100%;
    }
    .navigation-button,
    .navigation-button-link button {
        padding: 0 12px;

        background: transparent;
        border: 0;
        border-radius: 4px;

        cursor: pointer;

        &:hover {
            background: rgba(0, 0, 0, 0.1);
        }
    }
    .devcore-theme-panel {
        position: absolute;
        top: calc(100% + 0.5rem);
        left: 0.75rem;
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
        height: auto;
        padding: 0.4rem 0.7rem;
        background: rgba(255, 255, 255, 0.1);
    }
</style>
