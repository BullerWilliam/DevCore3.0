import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import tryCatch from '$lib/resources/try-catch';

const arrayOrDefault = value => Array.isArray(value) ? value : [];
const booleanOrDefault = (value, fallback) => typeof value === 'boolean' ? value : fallback;
const stringOrDefault = (value, fallback) => typeof value === 'string' ? value : fallback;

/**
 * @type {StoreSettingsInterface}
 */
export const defaultSettings = {
    loggedIn: false,
    token: "",

    appTheme: "light",
    appLanguage: "browser",

    alertDismissed: [],
    alertStatusDismissed: [],
};

export const normalizeSettings = value => {
    const normalized = value && typeof value === 'object' && !Array.isArray(value)
        ? value
        : {};

    const appTheme = normalized.appTheme === 'dark' ? 'dark' : defaultSettings.appTheme;
    const appLanguage = typeof normalized.appLanguage === 'string' && normalized.appLanguage.trim().length > 0
        ? normalized.appLanguage
        : defaultSettings.appLanguage;

    return {
        ...defaultSettings,
        ...normalized,
        loggedIn: booleanOrDefault(normalized.loggedIn, defaultSettings.loggedIn),
        token: stringOrDefault(normalized.token, defaultSettings.token),
        appTheme,
        appLanguage,
        alertDismissed: arrayOrDefault(normalized.alertDismissed),
        alertStatusDismissed: arrayOrDefault(normalized.alertStatusDismissed),
    };
};

// NOTE: uses localStorage
const settings = writable(defaultSettings);
if (browser) {
    const stringStored = localStorage.getItem('pm:settings');
    const saved = tryCatch(() => JSON.parse(stringStored));
    if (saved) {
        settings.set(normalizeSettings(saved));

        // NOTE: We use document events incase we have a reason to listen to these updates outside of Svelte
        document.dispatchEvent(new CustomEvent("penguinmod-store-settings-updated"));
    }
    settings.subscribe((value) => {
        localStorage.setItem('pm:settings', JSON.stringify(normalizeSettings(value)));
        document.dispatchEvent(new CustomEvent("penguinmod-store-settings-updated"));
    });
}

// NOTE: UNIMPORTANT: Should we just rename this to StoreSettings to match every usage of it?
export default settings;