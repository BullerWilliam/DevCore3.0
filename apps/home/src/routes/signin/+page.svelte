<script>
    import { browser } from "$app/environment";
    import { onMount } from "svelte";

    import Captcha from "$lib/components/Captcha.svelte";
    import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";
    import LocalizedString from "$lib/components/Localization/LocalizedString.svelte";
    import DevCoreAccountAPI from "$lib/resources/devcore/account-api";
    import Authenticator from "$lib/resources/penguinmod/authentication/authenticator.js";

    let username = $state("");
    let password = $state("");
    let showPassword = $state(false);
    let apiOnline = $state(true);
    let apiChecked = $state(false);
    let captchaToken = $state("");
    let loggingIn = $state(false);
    let authError = $state("");

    const redirectPath = $derived.by(() => {
        if (!browser) return "/";

        const params = new URLSearchParams(window.location.search);
        const requested = params.get("redirect") || "/";
        return requested.startsWith("/") ? requested : "/";
    });
    const canSubmit = $derived(Boolean(username.trim() && password && captchaToken && !loggingIn));

    const checkApi = async () => {
        try {
            apiOnline = await DevCoreAccountAPI.checkApiOnline();
        } catch {
            apiOnline = false;
        } finally {
            apiChecked = true;
        }
    };

    onMount(() => {
        checkApi();
    });

    const finishLogin = async token => {
        await Authenticator.loginToken(token);
        window.location.href = redirectPath;
    };

    const handlePasswordLogin = async () => {
        if (!canSubmit) return;

        loggingIn = true;
        authError = "";
        try {
            const result = await DevCoreAccountAPI.passwordLogin({
                username: username.trim(),
                password,
                captchaToken,
            });
            await finishLogin(result.token);
        } catch (error) {
            authError = error?.message || "Login failed.";
        } finally {
            loggingIn = false;
        }
    };

    const startOauth = method => {
        authError = "";
        DevCoreAccountAPI.openOauthPopup({
            mode: "signin",
            method,
            onSuccess: async payload => {
                try {
                    await finishLogin(payload.token);
                } catch (error) {
                    authError = error?.message || "OAuth login failed.";
                }
            },
            onError: error => {
                authError = error?.message === "PopupBlocked"
                    ? "Please allow popups to sign in with this provider."
                    : (error?.message || "OAuth login failed.");
            },
        });
    };
</script>

<svelte:head>
    <title>Sign In to DevCore</title>
</svelte:head>

<main class="auth-page">
    <section class="auth-card">
        <p class="eyebrow">DevCore Account</p>
        <h1>Sign in</h1>
        <p class="intro">
            Use your DevCore account to reach My Stuff, profile tools, and the shared project
            system inside the unified home app.
        </p>

        {#if apiChecked && !apiOnline}
            <div class="status-box status-error">
                The account API is not responding right now. You can still use the public home,
                editor, and packager surfaces while we keep consolidating the backend.
            </div>
        {:else}
            <div class="auth-stack">
                <div class="oauth-grid">
                    <button type="button" class="oauth-button" onclick={() => startOauth("google")}>Google</button>
                    <button type="button" class="oauth-button" onclick={() => startOauth("github")}>GitHub</button>
                    <button type="button" class="oauth-button" onclick={() => startOauth("scratch")}>Scratch</button>
                </div>

                <div class="separator">or</div>

                <label class="field">
                    <span class="field-label">
                        <LocalizedString text="Username" key="account.fields.username" />
                    </span>
                    <input
                        bind:value={username}
                        type="text"
                        maxlength="20"
                        placeholder="Your username"
                        autocomplete="username"
                    />
                </label>

                <label class="field">
                    <span class="field-label">
                        <LocalizedString text="Password" key="account.fields.password" />
                    </span>
                    <div class="password-row">
                        <input
                            bind:value={password}
                            type={showPassword ? "text" : "password"}
                            maxlength="50"
                            placeholder="Your password"
                            autocomplete="current-password"
                        />
                        <button type="button" class="ghost-button" onclick={() => (showPassword = !showPassword)}>
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                </label>

                <div class="field">
                    <span class="field-label">
                        <LocalizedString
                            text="Please complete the captcha:"
                            key="login.captcha.introduce.alt"
                        />
                    </span>
                    <Captcha on:update={event => (captchaToken = event.detail)} />
                </div>

                <button
                    type="button"
                    class="submit-button"
                    disabled={!canSubmit}
                    onclick={handlePasswordLogin}
                >
                    {#if loggingIn}
                        <LoadingSpinner tips={false} />
                    {:else}
                        <LocalizedString text="Login" key="login.confirm" />
                    {/if}
                </button>

                {#if authError}
                    <div class="status-box status-error">{authError}</div>
                {/if}

                <div class="auth-links">
                    <a href="/forgotpassword">
                        <LocalizedString
                            text="Forgot your password? Reset it here."
                            key="login.linkto.forgot"
                        />
                    </a>
                    <a href={`/signup?redirect=${encodeURIComponent(redirectPath)}`}>
                        <LocalizedString
                            text="Don't have an account? Sign up here!"
                            key="login.linkto.signup"
                        />
                    </a>
                </div>
            </div>
        {/if}
    </section>
</main>

<style>
    .auth-page {
        min-height: calc(100vh - 3rem);
        padding: 4rem 1.5rem 3rem;
        background:
            radial-gradient(circle at top left, rgba(39, 191, 36, 0.2), transparent 28rem),
            linear-gradient(180deg, rgba(255, 159, 26, 0.08), transparent 24rem),
            #f7fbf6;
        display: flex;
        justify-content: center;
    }

    .auth-card {
        width: min(34rem, 100%);
        padding: 1.6rem;
        border-radius: 1.25rem;
        background: rgba(255, 255, 255, 0.9);
        box-shadow: 0 20px 45px rgba(10, 26, 40, 0.12);
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
        margin: 0.4rem 0 0.7rem;
    }

    .intro {
        margin: 0 0 1.2rem;
        line-height: 1.6;
    }

    .auth-stack {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .oauth-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.75rem;
    }

    .oauth-button,
    .submit-button,
    .ghost-button {
        border: 0;
        border-radius: 0.95rem;
        font-weight: 700;
        cursor: pointer;
    }

    .oauth-button {
        padding: 0.9rem 0.85rem;
        background: rgba(39, 191, 36, 0.1);
        color: #134717;
    }

    .separator {
        text-align: center;
        color: rgba(10, 26, 40, 0.65);
        font-size: 0.9rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
    }

    .field-label {
        font-size: 0.9rem;
        font-weight: 700;
    }

    input {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid rgba(10, 26, 40, 0.18);
        border-radius: 0.95rem;
        padding: 0.9rem 1rem;
        font: inherit;
        background: rgba(255, 255, 255, 0.96);
    }

    .password-row {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 0.6rem;
        align-items: center;
    }

    .ghost-button {
        padding: 0.85rem 1rem;
        background: rgba(10, 26, 40, 0.08);
        color: inherit;
    }

    .submit-button {
        min-height: 3.15rem;
        padding: 0.9rem 1rem;
        background: var(--devcore-topbar, #27bf24);
        color: #fff;
    }

    .submit-button:disabled {
        opacity: 0.55;
        cursor: not-allowed;
    }

    .status-box {
        border-radius: 1rem;
        padding: 0.95rem 1rem;
        line-height: 1.55;
    }

    .status-error {
        background: rgba(207, 46, 46, 0.1);
        color: #8c1d1d;
    }

    .auth-links {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    a {
        color: var(--devcore-topbar, #27bf24);
        font-weight: 700;
        text-decoration: none;
    }

    a:hover {
        text-decoration: underline;
    }

    :global(body.app-theme-dark) .auth-page {
        background:
            radial-gradient(circle at top left, rgba(39, 191, 36, 0.24), transparent 28rem),
            linear-gradient(180deg, rgba(255, 159, 26, 0.12), transparent 24rem),
            #101312;
    }

    :global(body.app-theme-dark) .auth-card {
        background: rgba(17, 17, 17, 0.9);
        box-shadow: 0 20px 45px rgba(0, 0, 0, 0.28);
    }

    :global(body.app-theme-dark) input {
        background: rgba(25, 25, 25, 0.95);
        border-color: rgba(255, 255, 255, 0.16);
        color: #fff;
    }

    :global(body.app-theme-dark) .oauth-button {
        background: rgba(39, 191, 36, 0.14);
        color: #dfffdc;
    }

    :global(body.app-theme-dark) .ghost-button {
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
    }

    :global(body.app-theme-dark) .separator {
        color: rgba(255, 255, 255, 0.6);
    }

    :global(body.app-theme-dark) .status-error {
        background: rgba(207, 46, 46, 0.16);
        color: #ffb8b8;
    }

    @media (max-width: 720px) {
        .oauth-grid {
            grid-template-columns: 1fr;
        }
    }
    </style>
