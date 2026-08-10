<script>
    import { onMount } from "svelte";
    import { get } from "svelte/store";

    import Icon from "$lib/components/Icon/Component.svelte";
    import { CACHE_BASIC_API_STATUS } from "$lib/resources/cache/cache-time";
    import CacheHelper from "$lib/resources/cache/cache-helper";
    import externalLinks from "$lib/resources/external-links";
    import PenguinModBasicAPI from "$lib/resources/penguinmod/basic-api";
    import StoreSession from "$lib/stores/session";
    import StoreSettings from "$lib/stores/settings";

    const cleanupDismissedAlerts = (alerts = []) => {
        const activeIds = new Set(
            alerts
                .filter(alert => alert && typeof alert.id === "string")
                .map(alert => alert.id)
        );
        const currentSettings = get(StoreSettings);
        const dismissed = Array.isArray(currentSettings.alertStatusDismissed)
            ? currentSettings.alertStatusDismissed
            : [];
        const nextDismissed = dismissed.filter(id => activeIds.has(id));

        if (nextDismissed.length === dismissed.length) return;

        StoreSettings.update(current => ({
            ...current,
            alertStatusDismissed: nextDismissed,
        }));
    };

    const loadingAttempt = async () => {
        if (!CacheHelper.isExpired("alertStatusCachedTime", CACHE_BASIC_API_STATUS)) {
            cleanupDismissedAlerts(get(StoreSession).alertStatusCachedAlerts);
            return;
        }

        const alerts = await PenguinModBasicAPI.statusUpdates();
        CacheHelper.update({
            alertStatusCachedAlerts: alerts,
        });
        cleanupDismissedAlerts(alerts);
    };

    const dismissAlert = alertId => {
        if (typeof alertId !== "string" || alertId.length <= 0) return;

        StoreSettings.update(current => {
            const dismissed = Array.isArray(current.alertStatusDismissed)
                ? current.alertStatusDismissed
                : [];

            if (dismissed.includes(alertId)) return current;

            return {
                ...current,
                alertStatusDismissed: [...dismissed, alertId],
            };
        });
    };

    const activeAlerts = $derived.by(() => {
        const dismissedIds = Array.isArray($StoreSettings.alertStatusDismissed)
            ? $StoreSettings.alertStatusDismissed
            : [];
        const activeDismissedIds = new Set(dismissedIds);

        return $StoreSession.alertStatusCachedAlerts.filter(alert =>
            Boolean(alert?.active)
            && typeof alert?.id === "string"
            && !activeDismissedIds.has(alert.id)
        );
    });

    onMount(async () => {
        try {
            await loadingAttempt();
        } catch (err) {
            console.error(err);
        }
    });
</script>

{#if activeAlerts.length > 0}
    <div class="status-alert-stack">
        {#each activeAlerts as alert}
            <section class="status-alert" aria-live="polite">
                <div class="status-alert-icon">
                    <Icon filled={true}>warning</Icon>
                </div>
                <div class="status-alert-copy">
                    <p class="status-alert-eyebrow">Service alert</p>
                    <p class="status-alert-text">{alert.text}</p>
                    <div class="status-alert-actions">
                        <a
                            class="status-alert-link"
                            href={alert.detail || externalLinks.status}
                            target="_blank"
                            rel="noreferrer"
                        >
                            View status page
                        </a>
                        <button
                            type="button"
                            class="status-alert-dismiss"
                            aria-label="Dismiss status alert"
                            onclick={() => dismissAlert(alert.id)}
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            </section>
        {/each}
    </div>
{/if}

<style>
    .status-alert-stack {
        width: min(90%, 1500px);
        margin: 16px auto 0;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .status-alert {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding: 16px 18px;
        border: 1px solid rgba(174, 120, 0, 0.22);
        border-radius: 18px;
        background:
            linear-gradient(135deg, rgba(255, 242, 199, 0.95), rgba(255, 231, 170, 0.98));
        color: #573100;
        box-shadow: 0 10px 30px rgba(176, 122, 0, 0.12);
    }

    .status-alert-icon {
        width: 42px;
        height: 42px;
        border-radius: 999px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.7);
        color: #8b5b00;
    }

    .status-alert-copy {
        flex: 1;
        min-width: 0;
    }

    .status-alert-eyebrow,
    .status-alert-text {
        margin: 0;
    }

    .status-alert-eyebrow {
        font-size: 0.78rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }

    .status-alert-text {
        margin-top: 4px;
        font-size: 1rem;
        font-weight: 700;
        line-height: 1.45;
    }

    .status-alert-actions {
        margin-top: 12px;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;
    }

    .status-alert-link,
    .status-alert-dismiss {
        border-radius: 999px;
        font-weight: 700;
        font-size: 0.92rem;
    }

    .status-alert-link {
        padding: 9px 14px;
        color: #573100;
        text-decoration: none;
        background: rgba(255, 255, 255, 0.78);
    }

    .status-alert-dismiss {
        padding: 9px 14px;
        border: 0;
        color: #573100;
        background: transparent;
        cursor: pointer;
    }

    .status-alert-link:hover,
    .status-alert-dismiss:hover {
        background: rgba(255, 255, 255, 0.92);
    }

    .status-alert-link:focus-visible,
    .status-alert-dismiss:focus-visible {
        outline: 3px solid rgba(139, 91, 0, 0.28);
        outline-offset: 2px;
    }

    :global(body.app-theme-dark) .status-alert {
        border-color: rgba(255, 202, 87, 0.24);
        background:
            linear-gradient(135deg, rgba(92, 68, 0, 0.94), rgba(66, 48, 0, 0.96));
        color: #ffe9a8;
        box-shadow: 0 16px 34px rgba(0, 0, 0, 0.25);
    }

    :global(body.app-theme-dark) .status-alert-icon,
    :global(body.app-theme-dark) .status-alert-link,
    :global(body.app-theme-dark) .status-alert-dismiss:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #ffe9a8;
    }

    :global(body.app-theme-dark) .status-alert-link,
    :global(body.app-theme-dark) .status-alert-dismiss {
        color: #ffe9a8;
    }

    @media (max-width: 720px) {
        .status-alert {
            padding: 14px;
        }

        .status-alert-icon {
            width: 38px;
            height: 38px;
        }

        .status-alert-actions {
            flex-direction: column;
            align-items: stretch;
        }

        .status-alert-link,
        .status-alert-dismiss {
            width: 100%;
            text-align: center;
        }
    }
</style>
