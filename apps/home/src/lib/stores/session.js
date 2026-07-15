import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import tryCatch from '$lib/resources/try-catch';

const arrayOrDefault = value => Array.isArray(value) ? value : [];

export const defaultFrontpageProjects = {
    selectedTag: "",
    featured: [],
    voted: [],
    tagged: [],
    latest: [],
    blocked: [],
};

const normalizeFrontpageProjects = value => {
    const normalized = value && typeof value === "object" && !Array.isArray(value)
        ? value
        : {};

    return {
        ...defaultFrontpageProjects,
        ...normalized,
        selectedTag: typeof normalized.selectedTag === "string" ? normalized.selectedTag : "",
        featured: arrayOrDefault(normalized.featured),
        voted: arrayOrDefault(normalized.voted),
        tagged: arrayOrDefault(normalized.tagged),
        latest: arrayOrDefault(normalized.latest),
        blocked: arrayOrDefault(normalized.blocked),
    };
};

/**
 * @type {StoreSessionInterface}
 */
export const defaultSession = {
    alertStatusCachedTime: 0,
    alertStatusCachedAlerts: [],

    userCachedTime: 0,
    userCachedId: "",
    userCachedUsername: "",
    userCachedDisplayName: "",
    userCachedBio: "", // TODO: Remove (see  todo elsewhere)
    userCachedUnreadCount: 0,
    userCachedRank: 0,
    userCachedCanRankUp: false,
    userCachedSupporter: false,
    userCachedMod: false,
    userCachedAdmin: false,
    
    userFeedCachedTime: 0,
    userFeedCachedData: [],

    frontpageUpdatesCachedTime: 0,
    frontpageUpdatesCachedUpdates: [],

    frontpageProjectsCachedTime: 0,
    frontpageProjectsCachedResult: {
        ...defaultFrontpageProjects,
    },
};

export const normalizeSession = value => {
    const normalized = value && typeof value === "object" && !Array.isArray(value)
        ? value
        : {};

    return {
        ...defaultSession,
        ...normalized,
        alertStatusCachedAlerts: arrayOrDefault(normalized.alertStatusCachedAlerts),
        userFeedCachedData: arrayOrDefault(normalized.userFeedCachedData),
        frontpageUpdatesCachedUpdates: arrayOrDefault(normalized.frontpageUpdatesCachedUpdates),
        frontpageProjectsCachedResult: normalizeFrontpageProjects(normalized.frontpageProjectsCachedResult),
    };
};

// NOTE: uses sessionStorage
// TODO: Session storage might be different between tabs.. thats a problem. Probably we will use BroadcastChannel to tell other tabs what the right info is on set.
const session = writable(defaultSession);
if (browser) {
    const stringStored = sessionStorage.getItem('pm:session');
    const saved = tryCatch(() => JSON.parse(stringStored));
    if (saved) {
        session.set(normalizeSession(saved));

        // NOTE: We use document events incase we have a reason to listen to these updates outside of Svelte
        document.dispatchEvent(new CustomEvent("penguinmod-store-session-updated"));
    }
    session.subscribe((value) => {
        sessionStorage.setItem('pm:session', JSON.stringify(value));
        document.dispatchEvent(new CustomEvent("penguinmod-store-session-updated"));
    });
}

// NOTE: UNIMPORTANT: Should we just rename this to StoreSession to match every usage of it?
export default session;
