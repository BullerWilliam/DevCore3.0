import PenguinModClient from "$lib/resources/penguinmod/client";
import { getEffectiveDevPanelPayload, hasDevPanelDraft } from "$lib/stores/dev-panel-drafts";

const shouldPreferOwnedFrontpage = () => {
    const host = globalThis?.location?.hostname?.toLowerCase();
    if (!host) return false;
    if (host === "localhost" || host === "127.0.0.1") return false;
    if (host.endsWith("penguinmod.com")) return false;
    return host.endsWith("vercel.app") || host.includes("devcore") || host.includes("dev-core");
};

class PenguinModFrontpageAPI {
    static async getFrontPage(login) {
        if (hasDevPanelDraft("frontpage")) {
            return getEffectiveDevPanelPayload("frontpage");
        }

        if (!shouldPreferOwnedFrontpage()) {
            return PenguinModClient.projects.getFrontPage(login);
        }

        const response = await fetch("/api/v1/projects/frontpage");
        if (!response.ok) {
            throw new Error(await response.text());
        }

        return await response.json();
    }
}

export default PenguinModFrontpageAPI;
