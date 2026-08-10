const normalizeOwnedProfileUsername = value => `${value || ""}`.trim().toLowerCase();

const buildOwnedProfileUrl = username => {
    const normalized = normalizeOwnedProfileUsername(username);
    if (!normalized) return null;
    return `/api/v1/devcore/profiles/${encodeURIComponent(normalized)}.json`;
};

class DevCorePublicProfileAPI {
    static normalizeUsername(username) {
        return normalizeOwnedProfileUsername(username);
    }

    static async getProfile(username) {
        const url = buildOwnedProfileUrl(username);
        if (!url) return null;

        const response = await fetch(url);
        if (response.status === 404) return null;
        if (!response.ok) {
            throw new Error(await response.text());
        }
        return response.json();
    }
}

export default DevCorePublicProfileAPI;
