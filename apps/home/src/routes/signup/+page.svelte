<script>
    import { browser } from "$app/environment";
    import { onMount } from "svelte";

    import Captcha from "$lib/components/Captcha.svelte";
    import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";
    import LocalizedString from "$lib/components/Localization/LocalizedString.svelte";
    import DevCoreAccountAPI from "$lib/resources/devcore/account-api";
    import Authenticator from "$lib/resources/penguinmod/authentication/authenticator.js";
    import CountryLookup from "../../../../home-legacy/src/resources/country-lookup.json";

    let username = $state("");
    let password = $state("");
    let email = $state("");
    let birthday = $state("");
    let country = $state("");
    let showPassword = $state(false);
    let apiOnline = $state(true);
    let apiChecked = $state(false);
    let captchaToken = $state("");
    let creatingAccount = $state(false);
    let authError = $state("");
    let usernameUnique = $state(false);
    let usernameCheckPending = $state(false);
    let usernameChecked = $state(false);
    let personalInfoConsent = $state(false);
    let accuracyConsent = $state(false);

    let usernameCheckTimeout = null;

    const redirectPath = $derived.by(() => {
        if (!browser) return "/";

        const params = new URLSearchParams(window.location.search);
        const requested = params.get("redirect") || "/";
        return requested.startsWith("/") ? requested : "/";
    });
    const usernameLengthValid = $derived(username.trim().length >= 3 && username.trim().length <= 20);
    const usernameCharsValid = $derived(/^[a-z0-9\-_]+$/i.test(username.trim() || " "));
    const emailValid = $derived(email.trim().length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()));
    const passwordLengthValid = $derived(password.length >= 8 && password.length <= 50);
    const passwordCaseValid = $derived(/[a-z]/.test(password) && /[A-Z]/.test(password));
    const passwordNumberValid = $derived(/[0-9]/.test(password));
    const passwordSymbolValid = $derived(/[^a-z0-9]/i.test(password));
    const birthdayValid = $derived(Boolean(birthday));
    const countryValid = $derived(CountryLookup.countryCodes.includes(country));
    const canSubmit = $derived(
        Boolean(
            usernameLengthValid
            && usernameCharsValid
            && usernameChecked
            && usernameUnique
            && emailValid
            && passwordLengthValid
            && passwordCaseValid
            && passwordNumberValid
            && passwordSymbolValid
            && birthdayValid
            && countryValid
            && personalInfoConsent
            && accuracyConsent
            && captchaToken
            && !creatingAccount
        )
    );

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

    const scheduleUsernameCheck = value => {
        if (!browser) return;

        if (usernameCheckTimeout) {
            clearTimeout(usernameCheckTimeout);
        }

        const trimmed = value.trim();
        usernameChecked = false;
        usernameUnique = false;

        if (!(trimmed.length >= 3 && trimmed.length <= 20 && /^[a-z0-9\-_]+$/i.test(trimmed))) {
            usernameCheckPending = false;
            return;
        }

        usernameCheckPending = true;
        usernameCheckTimeout = setTimeout(async () => {
            try {
                const result = await DevCoreAccountAPI.usernameExists(trimmed);
                usernameUnique = !result.exists;
                usernameChecked = true;
            } catch {
                usernameUnique = false;
                usernameChecked = false;
            } finally {
                usernameCheckPending = false;
            }
        }, 450);
    };

    const finishLogin = async token => {
        await Authenticator.loginToken(token);
        window.location.href = redirectPath;
    };

    const handleCreateAccount = async () => {
        if (!canSubmit) return;

        creatingAccount = true;
        authError = "";
        try {
            const result = await DevCoreAccountAPI.createAccount({
                username: username.trim(),
                password,
                email: email.trim(),
                birthday,
                country,
                captchaToken,
            });
            await finishLogin(result.token);
        } catch (error) {
            authError = error?.message || "Account creation failed.";
        } finally {
            creatingAccount = false;
        }
    };

    const startOauth = method => {
        authError = "";
        DevCoreAccountAPI.openOauthPopup({
            mode: "signup",
            method,
            onSuccess: async payload => {
                try {
                    await finishLogin(payload.token);
                } catch (error) {
                    authError = error?.message || "OAuth sign up failed.";
                }
            },
            onError: error => {
                authError = error?.message === "PopupBlocked"
                    ? "Please allow popups to sign up with this provider."
                    : (error?.message || "OAuth sign up failed.");
            },
        });
    };
</script>

<svelte:head>
    <title>Create a DevCore Account</title>
</svelte:head>

<main class="auth-page">
    <section class="auth-card auth-card-wide">
        <p class="eyebrow">DevCore Account</p>
        <h1>Create your account</h1>
        <p class="intro">
            This keeps the sign-up flow inside DevCore while we continue moving the shared
            account and project systems under the unified platform.
        </p>

        {#if apiChecked && !apiOnline}
            <div class="status-box status-error">
                The account API is not responding right now, so sign up is temporarily unavailable.
            </div>
        {:else}
            <div class="auth-stack">
                <div class="oauth-grid">
                    <button type="button" class="oauth-button" onclick={() => startOauth("google")}>Google</button>
                    <button type="button" class="oauth-button" onclick={() => startOauth("github")}>GitHub</button>
                    <button type="button" class="oauth-button" onclick={() => startOauth("scratch")}>Scratch</button>
                </div>

                <div class="separator">or</div>

                <div class="field-grid">
                    <label class="field">
                        <span class="field-label">
                            <LocalizedString text="Username" key="account.fields.username" />
                        </span>
                        <input
                            bind:value={username}
                            type="text"
                            maxlength="20"
                            placeholder="Use something iconic"
                            autocomplete="username"
                            oninput={event => scheduleUsernameCheck(event.currentTarget.value)}
                        />
                        <span class="hint">
                            {#if usernameCheckPending}
                                Checking username availability...
                            {:else if usernameChecked && usernameUnique}
                                Username is available.
                            {:else if usernameChecked && !usernameUnique}
                                Username is already taken.
                            {:else}
                                3-20 characters, letters, numbers, hyphens, or underscores.
                            {/if}
                        </span>
                    </label>

                    <label class="field">
                        <span class="field-label">
                            <LocalizedString text="Email" key="account.fields.email" />
                        </span>
                        <input
                            bind:value={email}
                            type="email"
                            maxlength="254"
                            placeholder="Your email address"
                            autocomplete="email"
                        />
                        <span class="hint">Optional, but useful for recovery and verification.</span>
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
                                placeholder="Create a strong password"
                                autocomplete="new-password"
                            />
                            <button type="button" class="ghost-button" onclick={() => (showPassword = !showPassword)}>
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                        <span class="hint">
                            Use 8-50 characters with upper/lowercase letters, a number, and a symbol.
                        </span>
                    </label>

                    <label class="field">
                        <span class="field-label">
                            <LocalizedString text="Country" key="account.fields.country" />
                        </span>
                        <select bind:value={country}>
                            <option value="">Select your country</option>
                            {#each CountryLookup.countryCodes as countryCode}
                                <option value={countryCode}>{CountryLookup.countryNames[countryCode]}</option>
                            {/each}
                        </select>
                    </label>

                    <label class="field">
                        <span class="field-label">
                            <LocalizedString text="Birthdate" key="account.fields.birthdate" />
                        </span>
                        <input bind:value={birthday} type="date" max="2099-12-31" />
                    </label>
                </div>

                <div class="field">
                    <span class="field-label">
                        <LocalizedString
                            text="Please complete the captcha:"
                            key="login.captcha.introduce.alt"
                        />
                    </span>
                    <Captcha on:update={event => (captchaToken = event.detail)} />
                </div>

                <label class="checkbox-row">
                    <input bind:checked={personalInfoConsent} type="checkbox" />
                    <span>
                        I agree to DevCore using my country and birthdate in line with the privacy
                        policy while the account system is being unified.
                    </span>
                </label>

                <label class="checkbox-row">
                    <input bind:checked={accuracyConsent} type="checkbox" />
                    <span>
                        I confirm the information I provided is accurate and can be used for account
                        safety, moderation, and recovery.
                    </span>
                </label>

                <p class="legal-note">
                    Creating a DevCore account means agreeing to the
                    <a href="/terms">terms</a>,
                    <a href="/guidelines/uploading">uploading guidelines</a>, and
                    <a href="/privacy">privacy policy</a>.
                </p>

                <button
                    type="button"
                    class="submit-button"
                    disabled={!canSubmit}
                    onclick={handleCreateAccount}
                >
                    {#if creatingAccount}
                        <LoadingSpinner tips={false} />
                    {:else}
                        <LocalizedString text="Create" key="signup.confirm" />
                    {/if}
                </button>

                {#if authError}
                    <div class="status-box status-error">{authError}</div>
                {/if}

                <a class="standalone-link" href={`/signin?redirect=${encodeURIComponent(redirectPath)}`}>
                    <LocalizedString
                        text="Already have an account? Sign in here!"
                        key="signup.linkto.signin"
                    />
                </a>
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

    .auth-card-wide {
        width: min(48rem, 100%);
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

    .field-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
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

    input,
    select {
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

    .hint {
        font-size: 0.82rem;
        color: rgba(10, 26, 40, 0.68);
        line-height: 1.45;
    }

    .checkbox-row {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.7rem;
        align-items: start;
        line-height: 1.5;
    }

    .checkbox-row input {
        width: 1.1rem;
        height: 1.1rem;
        margin-top: 0.15rem;
        padding: 0;
    }

    .legal-note {
        margin: 0;
        line-height: 1.6;
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

    .standalone-link,
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

    :global(body.app-theme-dark) input,
    :global(body.app-theme-dark) select {
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

    :global(body.app-theme-dark) .separator,
    :global(body.app-theme-dark) .hint {
        color: rgba(255, 255, 255, 0.6);
    }

    :global(body.app-theme-dark) .status-error {
        background: rgba(207, 46, 46, 0.16);
        color: #ffb8b8;
    }

    @media (max-width: 860px) {
        .field-grid,
        .oauth-grid {
            grid-template-columns: 1fr;
        }
    }
    </style>
