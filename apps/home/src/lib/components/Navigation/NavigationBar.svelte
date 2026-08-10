<script>
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
</script>

<div class="navigation-shell">
    <div class="navigation-bar">
        <button
            class="navigation-button navigation-language-button"
            {@attach LocalizedTooltip("navigation.language")}
            aria-label="Language"
            type="button"
        >
            <Icon>language</Icon>
            <Icon class="navigation-caret">expand_more</Icon>
        </button>

        <div class="navigation-row">
            <a class="navigation-logo-link" href="/">
                <img class="navigation-logo" src="/devcore-icon.png" alt="DevCore" />
            </a>

            <div class="navigation-logo-spacer"></div>

            <button
                class="navigation-button navigation-theme-button"
                onclick={optionThemeToggle}
                {@attach LocalizedTooltip("navigation.theme")}
                type="button"
            >
                <Icon filled={$StoreSettings.appTheme !== "light"}>dark_mode</Icon>
            </button>

            <a
                href={DEVCORE_EDITOR_PATH}
                class="navigation-button navigation-create-button"
                {@attach LocalizedTooltip("navigation.create")}
            >
                <LocalizedString text="Create" key="navigation.create" />
            </a>

            <form class="navigation-search" onsubmit={handleSearchSubmit}>
                <button class="navigation-search-button" type="submit" aria-label="Search">
                    <Icon>search</Icon>
                </button>
                <input
                    class="navigation-search-input"
                    type="search"
                    placeholder={searchPlaceholder()}
                    aria-label={searchPlaceholder()}
                    name="search"
                />
            </form>

            {#if StateApplication.loggedInProcessed && !($StoreSettings.loggedIn)}
                <a
                    href="/signin"
                    class="navigation-button navigation-auth-button"
                    {@attach LocalizedTooltip("navigation.login")}
                >
                    <LocalizedString text="Sign in" key="navigation.login" />
                </a>
                <a
                    href="/signup"
                    class="navigation-button navigation-auth-button"
                    {@attach LocalizedTooltip("navigation.signup")}
                >
                    <LocalizedString text="Sign up" key="navigation.signup" />
                </a>
            {:else if StateApplication.loggedInProcessed && $StoreSettings.loggedIn}
                <a class="navigation-button navigation-auth-button" href={profileHref()}>
                    <LocalizedString text="Profile" key="navigation.profile" />
                </a>
                <a class="navigation-button navigation-auth-button" href="/mystuff">
                    <LocalizedString text="My Stuff" key="navigation.mystuff" />
                </a>
                <a class="navigation-button navigation-auth-button" href="/settings">
                    <LocalizedString text="Settings" key="account.settings.title" />
                </a>
                <button class="navigation-button navigation-auth-button" onclick={handleLogout} type="button">
                    <LocalizedString text="Logout" key="navigation.logout" />
                </button>
            {/if}
        </div>
    </div>
</div>

<style>
    .navigation-shell {
        position: fixed;
        inset: 0 0 auto 0;
        z-index: 99999;
    }

    .navigation-bar {
        position: relative;
        min-height: 3rem;
        padding: 0 0.45rem;
        background: var(--devcore-topbar, #27bf24);
        color: #fff;
        box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.12);
        overflow: hidden;
    }

    .navigation-row {
        min-height: 3rem;
        margin-left: 2.4rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.12rem;
        white-space: nowrap;
    }

    .navigation-button,
    .navigation-logo-link {
        height: 2.15rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 0;
        border-radius: 0.2rem;
        background: transparent;
        color: #fff;
        text-decoration: none;
        font-size: 0.86rem;
        font-weight: 700;
        cursor: pointer;
        flex: 0 0 auto;
    }

    .navigation-button:hover,
    .navigation-logo-link:hover {
        background: rgba(0, 0, 0, 0.12);
    }

    .navigation-language-button {
        position: absolute;
        left: 4px;
        top: 0.42rem;
        padding: 0 0.45rem;
        gap: 0.1rem;
        border-radius: 0.15rem;
    }

    .navigation-theme-button {
        width: 2.15rem;
        padding: 0.5rem;
    }

    .navigation-theme-button :global(span),
    .navigation-language-button :global(span),
    .navigation-search-button :global(span) {
        font-size: 1.15rem;
    }

    .navigation-logo-link {
        width: 2.15rem;
        padding: 0;
        border-radius: 0.12rem;
    }

    .navigation-logo {
        width: 2.15rem;
        height: 2.15rem;
        object-fit: contain;
        display: block;
    }

    .navigation-logo-spacer {
        width: 12px;
        flex: 0 0 auto;
    }

    .navigation-create-button,
    .navigation-auth-button {
        padding: 0 0.8rem;
    }

    .navigation-search {
        height: 2.15rem;
        display: inline-flex;
        align-items: center;
        border-radius: 0.18rem;
        background: rgba(14, 84, 20, 0.38);
        overflow: hidden;
        flex: 0 1 22rem;
        min-width: 13rem;
        max-width: 22rem;
        padding: 0.08rem;
    }

    .navigation-search-button {
        width: 2.6rem;
        height: 100%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 0;
        background: transparent;
        color: #fff;
        cursor: pointer;
        flex: 0 0 auto;
    }

    .navigation-search-input {
        width: 100%;
        min-width: 0;
        height: 100%;
        border: 0;
        outline: 0;
        background: transparent;
        color: #fff;
        font-size: 0.88rem;
        font-weight: 600;
        padding: 0 0.95rem 0 0.15rem;
        border-radius: 0.08rem;
    }

    .navigation-search-input::placeholder {
        color: rgba(255, 255, 255, 0.82);
        opacity: 1;
    }

    .navigation-search:focus-within {
        box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.22);
    }

    @media (max-width: 900px) {
        .navigation-row {
            justify-content: flex-start;
            overflow-x: auto;
            scrollbar-width: none;
        }

        .navigation-row::-webkit-scrollbar {
            display: none;
        }
    }

    @media (max-width: 640px) {
        .navigation-bar {
            padding-right: 0.25rem;
        }

        .navigation-row {
            margin-left: 2.2rem;
        }

        .navigation-search {
            min-width: 10rem;
        }
    }
</style>
