<script>
    import { browser } from "$app/environment";
    import { onMount } from "svelte";

    import Captcha from "$lib/components/Captcha.svelte";
    import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";
    import LocalizedString from "$lib/components/Localization/LocalizedString.svelte";
    import DevCoreAccountAPI from "$lib/resources/devcore/account-api";

    let email = $state("");
    let apiOnline = $state(true);
    let apiChecked = $state(false);
    let captchaToken = $state("");
    let sending = $state(false);
    let statusMessage = $state("");
    let errorMessage = $state("");

    const emailValid = $derived(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()));
    const canSubmit = $derived(Boolean(emailValid && captchaToken && !sending));

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

    const handleSend = async () => {
        if (!canSubmit) return;

        sending = true;
        errorMessage = "";
        statusMessage = "";
        try {
            await DevCoreAccountAPI.sendResetPasswordEmail({
                email: email.trim(),
                captchaToken,
            });
            statusMessage = "Check your email for the password reset link.";
        } catch (error) {
            errorMessage = error?.message || "We could not send a reset email.";
        } finally {
            sending = false;
        }
    };
</script>

<svelte:head>
    <title>Reset Your DevCore Password</title>
</svelte:head>

<main class="auth-page">
    <section class="auth-card">
        <p class="eyebrow">DevCore Account</p>
        <h1>Forgot your password?</h1>
        <p class="intro">
            Enter your account email below and DevCore will ask the shared account backend to send
            a reset link.
        </p>

        {#if apiChecked && !apiOnline}
            <div class="status-box status-error">
                The account API is not responding right now, so password reset is temporarily
                unavailable.
            </div>
        {:else}
            <div class="auth-stack">
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
                    onclick={handleSend}
                >
                    {#if sending}
                        <LoadingSpinner tips={false} />
                    {:else}
                        <LocalizedString text="Send Email" key="forgotpassword.sendemail" />
                    {/if}
                </button>

                {#if statusMessage}
                    <div class="status-box status-success">{statusMessage}</div>
                {/if}
                {#if errorMessage}
                    <div class="status-box status-error">{errorMessage}</div>
                {/if}

                <a href="/signin">Back to sign in</a>
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

    .submit-button {
        min-height: 3.15rem;
        padding: 0.9rem 1rem;
        border: 0;
        border-radius: 0.95rem;
        background: var(--devcore-topbar, #27bf24);
        color: #fff;
        font-weight: 700;
        cursor: pointer;
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

    .status-success {
        background: rgba(39, 191, 36, 0.1);
        color: #14561d;
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

    :global(body.app-theme-dark) .status-error {
        background: rgba(207, 46, 46, 0.16);
        color: #ffb8b8;
    }

    :global(body.app-theme-dark) .status-success {
        background: rgba(39, 191, 36, 0.16);
        color: #bfffc4;
    }
    </style>
