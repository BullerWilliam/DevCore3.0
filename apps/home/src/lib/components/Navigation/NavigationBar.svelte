<script>
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
</script>

<div class="navigation-shell">
    <div class="navigation-bar">
        <div class="navigation-side navigation-side-left">
            <button
                class="navigation-circle-button navigation-language-button"
                {@attach LocalizedTooltip("navigation.language")}
                aria-label="Language"
                type="button"
            >
                <Icon>language</Icon>
                <Icon>expand_more</Icon>
            </button>
        </div>

        <div class="navigation-main">
            <a class="navigation-logo-link" href="/">
                <img
                    class="navigation-logo"
                    src="/devcore-icon.png"
                    alt="DevCore"
                />
            </a>

            <button
                class="navigation-moon-button"
                onclick={optionThemeToggle}
                {@attach LocalizedTooltip("navigation.theme")}
                type="button"
            >
                <Icon filled={$StoreSettings.appTheme !== "light"}>dark_mode</Icon>
            </button>

            <a
                href={DEVCORE_EDITOR_PATH}
                class="navigation-create-link"
                {@attach LocalizedTooltip("navigation.create")}
            >
                <LocalizedString
                    text="Create"
                    key="navigation.create"
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

        <div class="navigation-side navigation-side-right">
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
                <a class="navigation-auth-link" href={profileHref()}>
                    <LocalizedString
                        text="Profile"
                        key="navigation.profile"
                    />
                </a>
                <a class="navigation-auth-link" href="/mystuff">
                    <LocalizedString
                        text="My Stuff"
                        key="navigation.mystuff"
                    />
                </a>
                <a class="navigation-auth-link" href="/settings">
                    <LocalizedString
                        text="Settings"
                        key="account.settings.title"
                    />
                </a>
                <button
                    class="navigation-auth-button"
                    onclick={handleLogout}
                    type="button"
                >
                    <LocalizedString
                        text="Logout"
                        key="navigation.logout"
                    />
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
        min-height: 3rem;
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
        align-items: center;
        gap: 0.75rem;
        padding: 0 0.8rem;
        background: #0fa9d8;
        color: #fff;
        box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.12);
    }

    .navigation-side,
    .navigation-main {
        min-width: 0;
        display: flex;
        align-items: center;
    }

    .navigation-side-left {
        justify-content: flex-start;
    }

    .navigation-side-right {
        justify-content: flex-end;
        gap: 0.25rem;
    }

    .navigation-main {
        justify-content: center;
        gap: 0.5rem;
    }

    .navigation-logo-link,
    .navigation-auth-link,
    .navigation-auth-button,
    .navigation-create-link,
    .navigation-moon-button,
    .navigation-circle-button {
        color: #fff;
        font-size: 0.86rem;
        font-weight: 700;
        text-decoration: none;
    }

    .navigation-logo-link,
    .navigation-moon-button,
    .navigation-circle-button {
        width: 2.15rem;
        height: 2.15rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 0;
        border-radius: 999px;
        background: transparent;
        cursor: pointer;
        flex: 0 0 auto;
    }

    .navigation-logo {
        width: 2.35rem;
        height: 2.35rem;
        object-fit: contain;
        display: block;
    }

    .navigation-moon-button :global(span),
    .navigation-circle-button :global(span) {
        font-size: 1.15rem;
    }

    .navigation-language-button {
        width: auto;
        padding: 0 0.3rem;
        gap: 0.05rem;
    }

    .navigation-create-link {
        height: 2rem;
        padding: 0 0.95rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.18);
        white-space: nowrap;
    }

    .navigation-search {
        width: min(29rem, 38vw);
        height: 2.2rem;
        padding: 0 0.95rem;
        display: flex;
        align-items: center;
        gap: 0.55rem;
        border-radius: 999px;
        background: #fff;
        color: #54606f;
        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
    }

    .navigation-search input {
        width: 100%;
        min-width: 0;
        border: 0;
        outline: 0;
        background: transparent;
        color: #54606f;
        font-size: 0.9rem;
        font-weight: 600;
    }

    .navigation-search :global(span) {
        color: #5d6a76;
        font-size: 1.15rem;
    }

    .navigation-auth-link,
    .navigation-auth-button {
        height: 2rem;
        padding: 0 0.7rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 0;
        border-radius: 999px;
        background: transparent;
        cursor: pointer;
        white-space: nowrap;
    }

    .navigation-auth-link:hover,
    .navigation-auth-button:hover,
    .navigation-create-link:hover,
    .navigation-moon-button:hover,
    .navigation-circle-button:hover,
    .navigation-logo-link:hover {
        background: rgba(0, 0, 0, 0.12);
    }

    .navigation-logo-link:hover {
        border-radius: 999px;
    }

    .navigation-search:focus-within {
        box-shadow: inset 0 0 0 2px rgba(15, 169, 216, 0.28);
    }

    @media (max-width: 980px) {
        .navigation-bar {
            grid-template-columns: auto 1fr auto;
        }

        .navigation-main {
            justify-content: flex-start;
        }

        .navigation-search {
            width: min(100%, 24rem);
        }
    }

    @media (max-width: 760px) {
        .navigation-bar {
            gap: 0.45rem;
            padding: 0 0.45rem;
        }

        .navigation-main {
            gap: 0.35rem;
        }

        .navigation-search {
            width: min(100%, 13rem);
            padding: 0 0.7rem;
        }

        .navigation-auth-link,
        .navigation-auth-button,
        .navigation-create-link {
            padding: 0 0.55rem;
            font-size: 0.8rem;
        }
    }
</style>
