import externalLinks from "$lib/resources/external-links.js";
import { PUBLIC_BASIC_API_URL } from "$lib/resources/public-env";
import { getEffectiveDevPanelPayload, hasDevPanelDraft } from "$lib/stores/dev-panel-drafts";

const shouldPreferOwnedBasicApi = () => {
    const host = globalThis?.location?.hostname?.toLowerCase();
    if (!host) return false;
    if (host === "localhost" || host === "127.0.0.1") return false;
    if (host.endsWith("penguinmod.com") || host.endsWith("derpygamer2142.com")) return false;
    return host.endsWith("vercel.app") || host.includes("devcore") || host.includes("dev-core");
};

const buildBasicApiUrl = (pathname) => {
    const fallback = shouldPreferOwnedBasicApi()
        ? "/basic-api"
        : "https://penguinmod-basic-api.derpygamer2142.com";
    const base = typeof PUBLIC_BASIC_API_URL === "string" && PUBLIC_BASIC_API_URL.trim()
        ? PUBLIC_BASIC_API_URL.trim()
        : fallback;

    if (/^https?:\/\//i.test(base)) {
        const url = new URL(base);
        url.pathname = pathname;
        return url.toString();
    }

    const normalizedBase = base === "/" ? "" : base.replace(/\/$/, "");
    return `${normalizedBase}${pathname}`;
};

class PenguinModBasicAPI {
    /**
     * Gets the current status updates.
     * 
     * Only returns a single active update if present as of now, but should ideally be
     * built to be compatible for multiple inactive and active status updates.
     * @returns {Promise<PenguinModBasicAPITypes.StatusUpdate[]>}
     */
    static async statusUpdates() {
        const json = hasDevPanelDraft("basicApi")
            ? getEffectiveDevPanelPayload("basicApi")?.status
            : await (async () => {
                const response = await fetch(buildBasicApiUrl("/status"));
                if (!response.ok)
                    throw new Error(await response.text());
                return response.json();
            })();
        // TODO: UNIMPORTANT: BasicAPI should support having a history of status updates, and maybe multiple active? (that might not be necessary)
        // TODO: UNIMPORTANT: BasicAPI should support being able to link to other websites (or no website) rather than only the status page 
        // NOTE: if this api ever updates to returns an array then return that directly
        return json.type === "empty" ? [] : [{
            // NOTE: this is extra info that maybe the api should return later
            id: `temporary id ${json.text}`,
            active: true,
            detail: externalLinks.status,
            date: Date.now(),
            // dump the rest of update here
            ...json,
        }];
    }
    
    /**
     * Gets the current PenguinMod updates and formats them for display.
     * 
     * Only returns a single update as of now, but should ideally be
     * built to be compatible for multiple updates for a "changelog" esque menu.
     * @returns {Promise<PenguinModBasicAPITypes.Update[]>}
     */
    static async updates() {
        const json = hasDevPanelDraft("basicApi")
            ? getEffectiveDevPanelPayload("basicApi")?.updates
            : await (async () => {
                const response = await fetch(buildBasicApiUrl("/updates"));
                if (!response.ok)
                    throw new Error(await response.text());
                return response.json();
            })();
        // TODO: UNIMPORTANT: BasicAPI should support having a history of site updates
        // TODO: UNIMPORTANT: BasicAPI should probably return headline & content itself
        // NOTE: if this api ever updates to returns an array then return that directly
        return [json].map(formatBasicApiUpdate);
    }
}

export const formatBasicApiUpdate = update => {
    const cleanContent = `${update.cleanContent || update.content || ""}`;
    const sentenceEnd = cleanContent.search(/[\.\?!]/i);
    const firstSplit = sentenceEnd >= 0
        ? sentenceEnd + cleanContent.slice(sentenceEnd).search(/\s/)
        : cleanContent.length;
    const headline = cleanContent.slice(0, firstSplit).trim();
    const content = cleanContent.slice(firstSplit).trim();

    return {
        id: update.id,
        guildId: update.guildId ? update.guildId : null,
        channelId: update.channelId ? update.channelId : null,
        createdTimestamp: update.createdTimestamp,
        editedTimestamp: update.editedTimestamp ? update.editedTimestamp : null,
        authorId: update.authorId ? update.authorId : null,
        authorName: update.authorName ? update.authorName : null,
        authorImage: update.authorImage ? update.authorImage : null,
        headline: headline,
        content: content,
        rawContent: cleanContent,
        image: update.image ? update.image : null,
    };
};

export default PenguinModBasicAPI;
