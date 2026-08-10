<script>
    import { env as publicEnv } from "$env/dynamic/public";
    import { createEventDispatcher, onMount } from "svelte";

    const dispatch = createEventDispatcher();

    let container = $state(null);
    let widgetId = null;
    let mockCompleted = $state(false);
    let mockExpired = $state(false);

    const captchaDisabled = publicEnv.PUBLIC_CAPTCHA_ENABLED === "false";

    const mockComplete = () => {
        mockCompleted = true;
        mockExpired = false;
        dispatch("update", "captcha_disabled");
    };
    const mockExpire = () => {
        mockExpired = true;
        mockCompleted = false;
        dispatch("update", false);
    };
    const mockReset = () => {
        mockCompleted = false;
        mockExpired = false;
        dispatch("update", false);
    };

    onMount(() => {
        if (captchaDisabled) return;

        const renderWidget = () => {
            if (!container || !window.turnstile) return;

            widgetId = window.turnstile.render(container, {
                sitekey: "0x4AAAAAAA0-uEePyt9NmTMl",
                callback: token => dispatch("update", token),
                "expired-callback": () => dispatch("update", false),
                "error-callback": () => {
                    if (widgetId !== null) {
                        window.turnstile.reset(widgetId);
                    }
                    dispatch("update", false);
                },
            });
        };

        if (window.turnstile) {
            renderWidget();
        } else {
            window.onTurnstileLoad = renderWidget;
        }

        return () => {
            if (window.onTurnstileLoad === renderWidget) {
                window.onTurnstileLoad = undefined;
            }
        };
    });
</script>

<svelte:head>
    {#if !captchaDisabled}
        <script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad"
            defer
        ></script>
    {/if}
</svelte:head>

{#if captchaDisabled}
    <div class="captcha-mock">
        <div class="captcha-mock-head">
            {#if mockExpired}
                <span>Captcha expired</span>
            {:else if mockCompleted}
                <span>Captcha complete</span>
            {:else}
                <span>Captcha emulator</span>
            {/if}
        </div>
        <div class="captcha-mock-actions">
            <button type="button" onclick={mockComplete}>I am not a robot</button>
            <button type="button" onclick={mockExpire}>Expire</button>
            <button type="button" onclick={mockReset}>Reset</button>
        </div>
    </div>
{:else}
    <div bind:this={container}></div>
{/if}

<style>
    .captcha-mock {
        width: 100%;
        padding: 0.85rem 0.95rem;
        border-radius: 1rem;
        border: 1px dashed rgba(39, 191, 36, 0.35);
        background: rgba(39, 191, 36, 0.06);
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .captcha-mock-head {
        font-size: 0.92rem;
        font-weight: 700;
    }

    .captcha-mock-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.55rem;
    }

    .captcha-mock-actions button {
        border: 0;
        border-radius: 999px;
        padding: 0.6rem 0.9rem;
        background: var(--devcore-topbar, #27bf24);
        color: #fff;
        font-weight: 700;
        cursor: pointer;
    }

    :global(body.app-theme-dark) .captcha-mock {
        background: rgba(39, 191, 36, 0.1);
        border-color: rgba(84, 214, 98, 0.4);
    }
    </style>
