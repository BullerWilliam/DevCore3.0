const PROFILE_SEED_OVERRIDES = {
    devcore: {
        id: "devcore-official",
        username: "devcore",
        real_username: "DevCore",
        displayName: "DevCore",
        badges: ["verified", "verifiedofficial", "dev"],
        donator: false,
        rank: 1,
        bio: "Official DevCore account for the unified single-repo clone effort.",
        followers: 0,
        privateProfile: false,
        canFollowingSeeProfile: false,
        isFollowing: false,
        projects: [],
    },
};

const PROFILE_SECTION_ORDER = {
    featured: 0,
    voted: 1,
    tagged: 2,
    latest: 3,
};

const normalizeUsername = value => `${value || ""}`.trim().toLowerCase();

const toProjectSummary = (project, sourceSection) => ({
    id: `${project?.id || ""}`,
    title: `${project?.title || "Untitled project"}`,
    featured: Boolean(project?.featured),
    views: Number(project?.views) || 0,
    loves: Number(project?.loves) || 0,
    votes: Number(project?.votes) || 0,
    date: Number(project?.date) || 0,
    lastUpdate: Number(project?.lastUpdate) || 0,
    featureDate: Number(project?.featureDate) || 0,
    fromDonator: Boolean(project?.fromDonator),
    sourceSections: [sourceSection],
    author: {
        id: `${project?.author?.id || ""}`,
        username: `${project?.author?.username || ""}`,
    },
});

const sortProjects = (left, right) => {
    if (Boolean(left.featured) !== Boolean(right.featured)) {
        return Number(Boolean(right.featured)) - Number(Boolean(left.featured));
    }

    const featureDelta = (right.featureDate || 0) - (left.featureDate || 0);
    if (featureDelta !== 0) return featureDelta;

    const updateDelta = (right.lastUpdate || 0) - (left.lastUpdate || 0);
    if (updateDelta !== 0) return updateDelta;

    const dateDelta = (right.date || 0) - (left.date || 0);
    if (dateDelta !== 0) return dateDelta;

    return (right.loves || 0) - (left.loves || 0);
};

const buildProfileFromSeed = (username, seed, metadata) => ({
    success: true,
    id: seed.id || username,
    username,
    real_username: seed.real_username || seed.displayName || username,
    displayName: seed.displayName || seed.real_username || username,
    badges: Array.isArray(seed.badges) ? [...seed.badges] : [],
    donator: Boolean(seed.donator),
    rank: Number(seed.rank) || 0,
    bio: `${seed.bio || "Public profile seeded by DevCore."}`,
    followers: Number(seed.followers) || 0,
    privateProfile: Boolean(seed.privateProfile),
    canFollowingSeeProfile: Boolean(seed.canFollowingSeeProfile),
    isFollowing: Boolean(seed.isFollowing),
    projectCount: 0,
    featuredProjectCount: 0,
    totalViews: 0,
    totalLoves: 0,
    totalVotes: 0,
    projects: Array.isArray(seed.projects) ? [...seed.projects] : [],
    ownershipMode: metadata.ownershipMode,
    mirroredAt: metadata.mirroredAt,
    mirroredFrom: metadata.mirroredFrom,
    source: "seeded-devcore-profile",
});

export const buildOwnedProfileCatalog = (frontpage = {}) => {
    const metadata = {
        mirroredAt: `${frontpage?.mirroredAt || ""}`,
        mirroredFrom: `${frontpage?.mirroredFrom || ""}`,
        ownershipMode: `${frontpage?.ownershipMode || "file-backed profile catalog"}`,
    };

    const projectMap = new Map();
    const sectionNames = ["featured", "voted", "tagged", "latest"];

    for (const sectionName of sectionNames) {
        const sectionProjects = Array.isArray(frontpage?.[sectionName]) ? frontpage[sectionName] : [];
        for (const project of sectionProjects) {
            const projectId = `${project?.id || ""}`;
            if (!projectId) continue;

            const existing = projectMap.get(projectId);
            if (!existing) {
                projectMap.set(projectId, toProjectSummary(project, sectionName));
                continue;
            }

            if (!existing.sourceSections.includes(sectionName)) {
                existing.sourceSections.push(sectionName);
                existing.sourceSections.sort(
                    (left, right) => (PROFILE_SECTION_ORDER[left] ?? 999) - (PROFILE_SECTION_ORDER[right] ?? 999)
                );
            }

            existing.featured = existing.featured || Boolean(project?.featured);
            existing.views = Math.max(existing.views, Number(project?.views) || 0);
            existing.loves = Math.max(existing.loves, Number(project?.loves) || 0);
            existing.votes = Math.max(existing.votes, Number(project?.votes) || 0);
            existing.date = Math.max(existing.date, Number(project?.date) || 0);
            existing.lastUpdate = Math.max(existing.lastUpdate, Number(project?.lastUpdate) || 0);
            existing.featureDate = Math.max(existing.featureDate, Number(project?.featureDate) || 0);
            existing.fromDonator = existing.fromDonator || Boolean(project?.fromDonator);
        }
    }

    const profilesByUsername = {};
    for (const [username, seed] of Object.entries(PROFILE_SEED_OVERRIDES)) {
        profilesByUsername[username] = buildProfileFromSeed(username, seed, metadata);
    }

    for (const project of projectMap.values()) {
        const username = normalizeUsername(project.author.username);
        if (!username) continue;

        if (!profilesByUsername[username]) {
            profilesByUsername[username] = {
                success: true,
                id: project.author.id || username,
                username,
                real_username: project.author.username || username,
                displayName: project.author.username || username,
                badges: [],
                donator: Boolean(project.fromDonator),
                rank: 0,
                bio: "Public creator card generated from the owned DevCore homepage project catalog.",
                followers: 0,
                privateProfile: false,
                canFollowingSeeProfile: false,
                isFollowing: false,
                projectCount: 0,
                featuredProjectCount: 0,
                totalViews: 0,
                totalLoves: 0,
                totalVotes: 0,
                projects: [],
                ownershipMode: metadata.ownershipMode,
                mirroredAt: metadata.mirroredAt,
                mirroredFrom: metadata.mirroredFrom,
                source: "homepage-project-catalog",
            };
        }

        const profile = profilesByUsername[username];
        profile.donator = profile.donator || Boolean(project.fromDonator);
        profile.projects.push(project);
        profile.projectCount += 1;
        profile.featuredProjectCount += Number(Boolean(project.featured));
        profile.totalViews += project.views;
        profile.totalLoves += project.loves;
        profile.totalVotes += project.votes;
    }

    for (const profile of Object.values(profilesByUsername)) {
        profile.projects.sort(sortProjects);
        profile.primaryProjectId = profile.projects[0]?.id || "";
        profile.featuredProjectId =
            profile.projects.find(project => project.featured)?.id || profile.primaryProjectId;
    }

    return {
        metadata,
        profilesByUsername,
        profiles: Object.values(profilesByUsername).sort((left, right) => {
            const countDelta = (right.projectCount || 0) - (left.projectCount || 0);
            if (countDelta !== 0) return countDelta;
            return left.username.localeCompare(right.username);
        }),
    };
};

export const normalizeOwnedProfileUsername = normalizeUsername;
