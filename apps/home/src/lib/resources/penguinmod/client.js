import { browser } from "$app/environment";
import { get } from "svelte/store";
import { PUBLIC_API_URL } from "$lib/resources/public-env";
import { PenguinModAPI } from "$lib/resources/penguinmod/module";

import StoreSettings from "$lib/stores/settings";

const normalizeApiUrl = (value) => {
    if (typeof value !== "string") return "/api";

    const trimmed = value.trim();
    if (!trimmed) return "/api";

    if (/^https?:\/\//i.test(trimmed)) {
        const url = new URL(trimmed);
        if (!url.pathname || url.pathname === "/") {
            url.pathname = "/api";
        }
        return url.toString().replace(/\/$/, "");
    }

    if (trimmed === "/") return "/api";

    const normalized = trimmed.replace(/\/$/, "");
    if (normalized.endsWith("/api")) return normalized;

    return `${normalized}/api`;
};

const apiUrl = normalizeApiUrl(PUBLIC_API_URL);

// get the current token so we dont need to use setToken everywhere (outside of auth at least)
let userToken = null;
if (browser) {
    const currentSettings = get(StoreSettings);
    if (currentSettings.loggedIn)
        userToken = currentSettings.token;
}

// make the cleint with the info we got earlier,,,
const PenguinModClient = new PenguinModAPI({
    apiUrl: apiUrl,
    token: userToken,
});
if (browser) {
    // TODO: UNIMPORTANT: Is it possible that adding our own telemetry is useful for the rampant malicious usage of the API?
    PenguinModClient.injectOptions = (options) => {
        // Keep request metadata stable across localhost and deployed hosts.
        // The API only needs to know which frontend is calling, not the current domain.
        return {
            headers: {
                "PenguinMod-FrontendType": "PenguinMod-HomeNew",
            },
        };
    };
}

export default PenguinModClient;
