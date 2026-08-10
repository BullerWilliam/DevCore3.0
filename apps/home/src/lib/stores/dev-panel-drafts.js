import { browser } from "$app/environment";
import { get, writable } from "svelte/store";

import homepageBasicApi from "$lib/content/dev-panel/homepage-basic-api";
import homepageFrontpage from "$lib/content/dev-panel/homepage-frontpage.json";
import homepageNews from "$lib/content/dev-panel/homepage-news";
import CacheHelper from "$lib/resources/cache/cache-helper";

const STORAGE_KEY = "devcore:dev-panel-drafts";

const cloneData = value => {
    if (value === null || typeof value === "undefined") return null;
    return JSON.parse(JSON.stringify(value));
};

const baseSourcePayloads = {
    frontpage: cloneData(homepageFrontpage),
    basicApi: cloneData(homepageBasicApi),
    news: cloneData(homepageNews),
};

const defaultDevPanelDrafts = {
    frontpage: null,
    basicApi: null,
    news: null,
    updatedAt: 0,
};

const normalizeDraftPayload = value => {
    if (value === null || typeof value === "undefined") return null;
    if (typeof value !== "object" || Array.isArray(value)) return null;
    return cloneData(value);
};

const normalizeDraftState = value => {
    const normalized = value && typeof value === "object" && !Array.isArray(value)
        ? value
        : {};

    return {
        ...defaultDevPanelDrafts,
        frontpage: normalizeDraftPayload(normalized.frontpage),
        basicApi: normalizeDraftPayload(normalized.basicApi),
        news: normalizeDraftPayload(normalized.news),
        updatedAt: Number(normalized.updatedAt) || 0,
    };
};

const invalidateRelatedCaches = draftKey => {
    if (!browser) return;

    if (draftKey === "frontpage") {
        CacheHelper.reset({
            frontpageProjectsCachedTime: true,
            frontpageProjectsCachedResult: true,
        });
        return;
    }

    if (draftKey === "basicApi") {
        CacheHelper.reset({
            alertStatusCachedTime: true,
            alertStatusCachedAlerts: true,
            frontpageUpdatesCachedTime: true,
            frontpageUpdatesCachedUpdates: true,
        });
    }
};

const drafts = writable(defaultDevPanelDrafts);

if (browser) {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
        try {
            drafts.set(normalizeDraftState(JSON.parse(stored)));
        } catch (error) {
            console.error(error);
        }
    }

    drafts.subscribe(value => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeDraftState(value)));
        document.dispatchEvent(new CustomEvent("devcore-dev-panel-drafts-updated"));
    });
}

const buildModuleText = (variableName, value) => {
    return `const ${variableName} = ${JSON.stringify(value, null, 4)};\n\nexport default ${variableName};\n`;
};

export const getDevPanelSourcePayloads = () => cloneData(baseSourcePayloads);

export const hasDevPanelDraft = draftKey => Boolean(get(drafts)?.[draftKey]);

export const getEffectiveDevPanelPayload = draftKey => {
    const state = get(drafts);
    const draft = state?.[draftKey];
    const source = baseSourcePayloads[draftKey];
    return cloneData(draft || source || null);
};

export const saveDevPanelDraft = (draftKey, payload) => {
    drafts.update(current => ({
        ...current,
        [draftKey]: normalizeDraftPayload(payload),
        updatedAt: Date.now(),
    }));
    invalidateRelatedCaches(draftKey);
};

export const clearDevPanelDraft = draftKey => {
    drafts.update(current => ({
        ...current,
        [draftKey]: null,
        updatedAt: Date.now(),
    }));
    invalidateRelatedCaches(draftKey);
};

export const clearAllDevPanelDrafts = () => {
    drafts.set({
        ...defaultDevPanelDrafts,
        updatedAt: Date.now(),
    });
    invalidateRelatedCaches("frontpage");
    invalidateRelatedCaches("basicApi");
};

export const buildDevPanelExportText = (draftKey, payload = null) => {
    const effectivePayload = payload || getEffectiveDevPanelPayload(draftKey);
    if (!effectivePayload) return "";

    if (draftKey === "frontpage") {
        return `${JSON.stringify(effectivePayload, null, 4)}\n`;
    }

    if (draftKey === "basicApi") {
        return buildModuleText("homepageBasicApi", effectivePayload);
    }

    if (draftKey === "news") {
        return buildModuleText("homepageNews", effectivePayload);
    }

    return `${JSON.stringify(effectivePayload, null, 4)}\n`;
};

export default drafts;
