<script>
    import { onMount } from "svelte";
    import { get } from "svelte/store";

    import homepageBasicApi from "$lib/content/dev-panel/homepage-basic-api";
    import homepageFrontpage from "$lib/content/dev-panel/homepage-frontpage.json";
    import homepageNews from "$lib/content/dev-panel/homepage-news";
    import runtimeRepos from "$lib/content/dev-panel/runtime-repos";
    import PenguinModClient from "$lib/resources/penguinmod/client";
    import { formatBasicApiUpdate } from "$lib/resources/penguinmod/basic-api";
    import Locale from "$lib/resources/localization/locale";
    import { buildSharedProjectPath } from "$lib/resources/site-paths";
    import StoreDevPanelDrafts, {
        buildDevPanelExportText,
        clearDevPanelDraft,
        getDevPanelSourcePayloads,
        saveDevPanelDraft,
    } from "$lib/stores/dev-panel-drafts";

    const contentSources = [
        {
            label: "Featured / voted / latest project rails",
            source: "$lib/content/dev-panel/homepage-frontpage.json -> /api/v1/projects/frontpage",
            status: "Editable in-repo and now draftable from the dev panel for local preview in the unified DevCore app.",
            next: "Replace local draft editing with authenticated persisted admin controls in the owned backend."
        },
        {
            label: "What's New block",
            source: "$lib/content/dev-panel/homepage-basic-api.js -> updates",
            status: "Editable in-repo and now draftable from the dev panel for local preview in the unified DevCore app.",
            next: "Replace local draft editing with authenticated persisted admin controls in the owned backend."
        },
        {
            label: "Status and recent commits feed",
            source: "$lib/content/dev-panel/homepage-basic-api.js -> status, commits",
            status: "Editable in-repo and now draftable from the dev panel for local preview in the unified DevCore app.",
            next: "Replace local draft editing with authenticated persisted admin controls in the owned backend."
        },
        {
            label: "DevCore News block",
            source: "$lib/content/dev-panel/homepage-news.js",
            status: "Editable in-repo and now draftable from the dev panel for local preview in the unified DevCore app.",
            next: "Replace local draft editing with authenticated persisted admin controls in the owned backend."
        }
    ];

    const emptyFrontpage = {
        mirroredAt: "",
        mirroredFrom: "",
        ownershipMode: "",
        selectedTag: "",
        blocked: [],
        featured: [],
        voted: [],
        tagged: [],
        latest: [],
    };

    const stringifyPayload = value => `${JSON.stringify(value, null, 4)}`;

    const parseJsonPayload = text => JSON.parse(text);

    const validateObjectPayload = (value, label) => {
        if (!value || typeof value !== "object" || Array.isArray(value)) {
            throw new Error(`${label} must be a JSON object.`);
        }
        return value;
    };

    const ensureArrayField = (value, key, label) => {
        if (!Array.isArray(value[key])) {
            throw new Error(`${label}.${key} must be an array.`);
        }
    };

    const validateFrontpagePayload = value => {
        const payload = validateObjectPayload(value, "Frontpage payload");
        ensureArrayField(payload, "featured", "Frontpage payload");
        ensureArrayField(payload, "voted", "Frontpage payload");
        ensureArrayField(payload, "latest", "Frontpage payload");
        ensureArrayField(payload, "tagged", "Frontpage payload");
        if ("blocked" in payload) ensureArrayField(payload, "blocked", "Frontpage payload");
        return payload;
    };

    const validateBasicApiPayload = value => {
        const payload = validateObjectPayload(value, "Basic API payload");
        validateObjectPayload(payload.status, "Basic API payload.status");
        validateObjectPayload(payload.updates, "Basic API payload.updates");
        ensureArrayField(payload, "commits", "Basic API payload");
        return payload;
    };

    const validateNewsPayload = value => {
        const payload = validateObjectPayload(value, "DevCore News payload");
        if (typeof payload.title !== "string") throw new Error("DevCore News payload.title must be a string.");
        ensureArrayField(payload, "body", "DevCore News payload");
        ensureArrayField(payload, "inlineLinks", "DevCore News payload");
        validateObjectPayload(payload.image, "DevCore News payload.image");
        validateObjectPayload(payload.footer, "DevCore News payload.footer");
        return payload;
    };

    const draftValidators = {
        frontpage: validateFrontpagePayload,
        basicApi: validateBasicApiPayload,
        news: validateNewsPayload,
    };

    const readEditorText = draftKey => {
        if (draftKey === "frontpage") return frontpageEditorText;
        if (draftKey === "basicApi") return basicApiEditorText;
        return newsEditorText;
    };

    const writeEditorText = (draftKey, value) => {
        if (draftKey === "frontpage") {
            frontpageEditorText = value;
            return;
        }
        if (draftKey === "basicApi") {
            basicApiEditorText = value;
            return;
        }
        newsEditorText = value;
    };

    const readEditorError = draftKey => {
        if (draftKey === "frontpage") return frontpageEditorError;
        if (draftKey === "basicApi") return basicApiEditorError;
        return newsEditorError;
    };

    const writeEditorError = (draftKey, value) => {
        if (draftKey === "frontpage") {
            frontpageEditorError = value;
            return;
        }
        if (draftKey === "basicApi") {
            basicApiEditorError = value;
            return;
        }
        newsEditorError = value;
    };

    const readEditorMessage = draftKey => {
        if (draftKey === "frontpage") return frontpageEditorMessage;
        if (draftKey === "basicApi") return basicApiEditorMessage;
        return newsEditorMessage;
    };

    const writeEditorMessage = (draftKey, value) => {
        if (draftKey === "frontpage") {
            frontpageEditorMessage = value;
            return;
        }
        if (draftKey === "basicApi") {
            basicApiEditorMessage = value;
            return;
        }
        newsEditorMessage = value;
    };

    const parseEditorPayload = draftKey => {
        writeEditorError(draftKey, "");
        const text = readEditorText(draftKey);

        try {
            return draftValidators[draftKey](parseJsonPayload(text));
        } catch (error) {
            console.error(error);
            writeEditorError(draftKey, error.message || "This payload could not be parsed.");
            return null;
        }
    };

    const sourcePayloads = getDevPanelSourcePayloads();

    let publishedFrontpageLoading = $state(true);
    let publishedFrontpageError = $state(null);
    let publishedFrontpageData = $state(emptyFrontpage);

    let publishedUpdatesLoading = $state(true);
    let publishedUpdatesError = $state(null);
    let publishedUpdatesData = $state([]);

    let panelMessage = $state("");

    let frontpageEditorText = $state("");
    let frontpageEditorError = $state("");
    let frontpageEditorMessage = $state("");

    let basicApiEditorText = $state("");
    let basicApiEditorError = $state("");
    let basicApiEditorMessage = $state("");

    let newsEditorText = $state("");
    let newsEditorError = $state("");
    let newsEditorMessage = $state("");

    const activeDraftCount = $derived(
        ["frontpage", "basicApi", "news"].filter(key => Boolean($StoreDevPanelDrafts[key])).length
    );

    const effectiveFrontpage = $derived($StoreDevPanelDrafts.frontpage || homepageFrontpage);
    const effectiveBasicApi = $derived($StoreDevPanelDrafts.basicApi || homepageBasicApi);
    const effectiveHomepageNews = $derived($StoreDevPanelDrafts.news || homepageNews);

    const effectiveUpdatesData = $derived(
        effectiveBasicApi?.updates ? [formatBasicApiUpdate(effectiveBasicApi.updates)] : []
    );

    const effectiveHomepageSections = $derived([
        {
            label: "Featured",
            items: effectiveFrontpage.featured || [],
        },
        {
            label: "Voted",
            items: effectiveFrontpage.voted || [],
        },
        {
            label: "Latest",
            items: effectiveFrontpage.latest || [],
        },
        {
            label: effectiveFrontpage.selectedTag
                ? `Tag: ${effectiveFrontpage.selectedTag}`
                : "Tagged",
            items: effectiveFrontpage.tagged || [],
        }
    ]);

    const publishedHomepageSections = $derived([
        {
            label: "Featured",
            items: publishedFrontpageData.featured || [],
        },
        {
            label: "Voted",
            items: publishedFrontpageData.voted || [],
        },
        {
            label: "Latest",
            items: publishedFrontpageData.latest || [],
        },
        {
            label: publishedFrontpageData.selectedTag
                ? `Tag: ${publishedFrontpageData.selectedTag}`
                : "Tagged",
            items: publishedFrontpageData.tagged || [],
        }
    ]);

    const draftSummary = $derived([
        {
            label: "Active local drafts",
            value: `${activeDraftCount}`,
        },
        {
            label: "Last draft change",
            value: $StoreDevPanelDrafts.updatedAt
                ? Locale.timestampToDateWithTime($StoreDevPanelDrafts.updatedAt)
                : "No local drafts yet",
        },
        {
            label: "Effective featured count",
            value: `${effectiveFrontpage.featured?.length || 0}`,
        },
        {
            label: "Published featured count",
            value: `${publishedFrontpageData.featured?.length || 0}`,
        },
    ]);

    const loadEditorFromPayload = (draftKey, payload) => {
        writeEditorText(draftKey, stringifyPayload(payload));
        writeEditorError(draftKey, "");
    };

    const loadEditorFromSource = draftKey => {
        loadEditorFromPayload(draftKey, sourcePayloads[draftKey]);
        writeEditorMessage(draftKey, "Loaded the checked-in source payload into the editor.");
    };

    const loadEditorFromDraft = draftKey => {
        const draft = get(StoreDevPanelDrafts)?.[draftKey];
        if (!draft) {
            writeEditorMessage(draftKey, "No saved local draft exists for this payload yet.");
            return;
        }

        loadEditorFromPayload(draftKey, draft);
        writeEditorMessage(draftKey, "Loaded the saved local draft into the editor.");
    };

    const saveEditorDraft = draftKey => {
        const parsed = parseEditorPayload(draftKey);
        if (!parsed) return;

        saveDevPanelDraft(draftKey, parsed);
        writeEditorMessage(draftKey, "Saved local draft. The unified DevCore preview now uses this override in your browser.");
        panelMessage = "Local homepage draft saved for preview.";
    };

    const clearEditorDraft = draftKey => {
        clearDevPanelDraft(draftKey);
        loadEditorFromSource(draftKey);
        writeEditorMessage(draftKey, "Cleared the saved local draft and restored the checked-in source payload.");
        panelMessage = "Local homepage draft cleared.";
    };

    const copyEditorExport = async draftKey => {
        const parsed = parseEditorPayload(draftKey);
        if (!parsed) return;

        const exportText = buildDevPanelExportText(draftKey, parsed);

        try {
            await navigator.clipboard.writeText(exportText);
            writeEditorMessage(
                draftKey,
                draftKey === "frontpage"
                    ? "Copied formatted JSON payload to the clipboard."
                    : "Copied JS module payload to the clipboard."
            );
        } catch (error) {
            console.error(error);
            writeEditorError(draftKey, "Clipboard copy failed in this browser session.");
        }
    };

    const fetchPublishedJson = async pathname => {
        const response = await fetch(pathname);
        if (!response.ok) {
            throw new Error(await response.text());
        }
        return response.json();
    };

    const loadPublishedData = async () => {
        const [frontpageResult, updatesResult] = await Promise.allSettled([
            fetchPublishedJson("/api/v1/projects/frontpage"),
            fetchPublishedJson("/basic-api/updates"),
        ]);

        if (frontpageResult.status === "fulfilled") {
            publishedFrontpageData = {
                ...emptyFrontpage,
                ...frontpageResult.value,
            };
        } else {
            console.error(frontpageResult.reason);
            publishedFrontpageError = frontpageResult.reason;
        }
        publishedFrontpageLoading = false;

        if (updatesResult.status === "fulfilled") {
            publishedUpdatesData = [formatBasicApiUpdate(updatesResult.value)];
        } else {
            console.error(updatesResult.reason);
            publishedUpdatesError = updatesResult.reason;
        }
        publishedUpdatesLoading = false;
    };

    onMount(async () => {
        loadEditorFromPayload("frontpage", get(StoreDevPanelDrafts).frontpage || homepageFrontpage);
        loadEditorFromPayload("basicApi", get(StoreDevPanelDrafts).basicApi || homepageBasicApi);
        loadEditorFromPayload("news", get(StoreDevPanelDrafts).news || homepageNews);
        await loadPublishedData();
    });
</script>

<svelte:head>
    <title>DevCore Dev Panel</title>
</svelte:head>

<main class="panel-page">
    <section class="panel-card hero-card">
        <p class="eyebrow">DevCore</p>
        <h1>Dev Panel</h1>
        <p>
            This is the control surface for the unified DevCore clone effort. It tracks which
            PenguinMod repos are actually needed, which of those repos already live inside this
            monorepo, and now gives DevCore maintainers a local draft studio for homepage rails,
            status, updates, and DevCore News.
        </p>
        <p>
            Reviewed upstream repos: <strong>{runtimeRepos.auditSummary.reviewedRepoCount}</strong> as of
            <strong>{runtimeRepos.reviewDate}</strong>.
        </p>
    </section>

    <section class="panel-card">
        <h2>Repo Audit Snapshot</h2>
        <div class="overview-grid">
            <article class="mini-card">
                <h3>Repos Reviewed</h3>
                <p>{runtimeRepos.auditSummary.reviewedRepoCount}</p>
            </article>
            <article class="mini-card">
                <h3>Repos Needed For DevCore Clone</h3>
                <p>{runtimeRepos.auditSummary.targetCloneRepoCount}</p>
            </article>
            <article class="mini-card">
                <h3>Needed Repos Already Copied In</h3>
                <p>{runtimeRepos.auditSummary.importedIntoRepoCount}</p>
            </article>
            <article class="mini-card">
                <h3>Critical Repos Already Copied In</h3>
                <p>{runtimeRepos.auditSummary.criticalImportedCount} / {runtimeRepos.criticalPath.length}</p>
            </article>
            <article class="mini-card">
                <h3>Needed Repos Still Missing</h3>
                <p>{runtimeRepos.auditSummary.missingFromRepoCount}</p>
            </article>
        </div>
    </section>

    <section class="panel-card">
        <h2>Live PenguinMod Org Snapshot</h2>
        <div class="overview-grid">
            <article class="mini-card">
                <h3>Public Repos</h3>
                <p>{runtimeRepos.currentOrgSnapshot.publicRepoCount}</p>
            </article>
            <article class="mini-card">
                <h3>Active Repos</h3>
                <p>{runtimeRepos.currentOrgSnapshot.activeRepoCount}</p>
            </article>
            <article class="mini-card">
                <h3>Archived Repos</h3>
                <p>{runtimeRepos.currentOrgSnapshot.archivedRepoCount}</p>
            </article>
            <article class="mini-card">
                <h3>Forked Repos</h3>
                <p>{runtimeRepos.currentOrgSnapshot.forkedRepoCount}</p>
            </article>
            <article class="mini-card">
                <h3>Non-Fork Repos</h3>
                <p>{runtimeRepos.currentOrgSnapshot.nonForkRepoCount}</p>
            </article>
        </div>
        <div class="stack">
            {#each runtimeRepos.selectionPrinciples as item}
                <article class="mini-card">
                    <p>{item}</p>
                </article>
            {/each}
        </div>
    </section>

    <section class="panel-card two-col">
        <div>
            <h2>Current Vercel Output Coverage</h2>
            <div class="stack">
                {#each runtimeRepos.currentVercelCoverage.liveNow as item}
                    <article class="mini-card">
                        <h3>{item.label}</h3>
                        <p>{item.source}</p>
                    </article>
                {/each}
            </div>
        </div>
        <div>
            <h2>Highest-Leverage Unified Runtime Gaps</h2>
            <div class="stack">
                {#each runtimeRepos.currentVercelCoverage.highestLeverageGaps as item}
                    <article class="mini-card muted-card">
                        <h3>{item.name}</h3>
                        <p>{item.why}</p>
                    </article>
                {/each}
            </div>
        </div>
    </section>

    <section class="panel-card">
        <h2>Homepage Content Sources</h2>
        <div class="stack">
            {#each contentSources as item}
                <article class="mini-card">
                    <h3>{item.label}</h3>
                    <p><strong>Current source:</strong> {item.source}</p>
                    <p><strong>Status:</strong> {item.status}</p>
                    <p><strong>Next step:</strong> {item.next}</p>
                </article>
            {/each}
        </div>
    </section>

    <section class="panel-card">
        <div class="section-header">
            <div>
                <h2>Control Studio</h2>
                <p>
                    These drafts live in your browser and immediately override the DevCore-owned
                    homepage feeds for local preview on this deployment.
                </p>
            </div>
            <div class="chip-row">
                <span class="status-chip">
                    {activeDraftCount > 0 ? `${activeDraftCount} local drafts active` : "No local drafts active"}
                </span>
            </div>
        </div>

        {#if panelMessage}
            <p class="panel-message">{panelMessage}</p>
        {/if}

        <div class="overview-grid">
            {#each draftSummary as item}
                <article class="mini-card">
                    <h3>{item.label}</h3>
                    <p>{item.value}</p>
                </article>
            {/each}
        </div>
    </section>

    <section class="panel-card">
        <div class="section-header section-header-stack">
            <div>
                <h2>Homepage Rails Draft</h2>
                <p>
                    Edit the owned frontpage JSON that powers featured, voted, latest, and tagged
                    project rails on DevCore.
                </p>
            </div>
            <p class="status-line">
                {$StoreDevPanelDrafts.frontpage ? "Local draft override active" : "Using checked-in source payload"}
            </p>
        </div>
        <div class="action-row">
            <button class="panel-button" type="button" onclick={() => loadEditorFromSource("frontpage")}>Load source</button>
            <button class="panel-button" type="button" onclick={() => loadEditorFromDraft("frontpage")} disabled={!$StoreDevPanelDrafts.frontpage}>Load draft</button>
            <button class="panel-button panel-button-primary" type="button" onclick={() => saveEditorDraft("frontpage")}>Save local draft</button>
            <button class="panel-button" type="button" onclick={() => copyEditorExport("frontpage")}>Copy JSON</button>
            <button class="panel-button panel-button-danger" type="button" onclick={() => clearEditorDraft("frontpage")}>Clear draft</button>
        </div>
        {#if frontpageEditorMessage}
            <p class="editor-message">{frontpageEditorMessage}</p>
        {/if}
        {#if frontpageEditorError}
            <p class="error-text">{frontpageEditorError}</p>
        {/if}
        <textarea class="payload-editor" rows="18" bind:value={frontpageEditorText}></textarea>
    </section>

    <section class="panel-card">
        <div class="section-header section-header-stack">
            <div>
                <h2>Basic API Draft</h2>
                <p>
                    Edit the owned homepage status, What's New payload, and recent commit mirror
                    used by the DevCore home app.
                </p>
            </div>
            <p class="status-line">
                {$StoreDevPanelDrafts.basicApi ? "Local draft override active" : "Using checked-in source payload"}
            </p>
        </div>
        <div class="action-row">
            <button class="panel-button" type="button" onclick={() => loadEditorFromSource("basicApi")}>Load source</button>
            <button class="panel-button" type="button" onclick={() => loadEditorFromDraft("basicApi")} disabled={!$StoreDevPanelDrafts.basicApi}>Load draft</button>
            <button class="panel-button panel-button-primary" type="button" onclick={() => saveEditorDraft("basicApi")}>Save local draft</button>
            <button class="panel-button" type="button" onclick={() => copyEditorExport("basicApi")}>Copy JS module</button>
            <button class="panel-button panel-button-danger" type="button" onclick={() => clearEditorDraft("basicApi")}>Clear draft</button>
        </div>
        {#if basicApiEditorMessage}
            <p class="editor-message">{basicApiEditorMessage}</p>
        {/if}
        {#if basicApiEditorError}
            <p class="error-text">{basicApiEditorError}</p>
        {/if}
        <textarea class="payload-editor" rows="18" bind:value={basicApiEditorText}></textarea>
    </section>

    <section class="panel-card">
        <div class="section-header section-header-stack">
            <div>
                <h2>DevCore News Draft</h2>
                <p>
                    Edit the owned DevCore News card payload that appears on the homepage.
                </p>
            </div>
            <p class="status-line">
                {$StoreDevPanelDrafts.news ? "Local draft override active" : "Using checked-in source payload"}
            </p>
        </div>
        <div class="action-row">
            <button class="panel-button" type="button" onclick={() => loadEditorFromSource("news")}>Load source</button>
            <button class="panel-button" type="button" onclick={() => loadEditorFromDraft("news")} disabled={!$StoreDevPanelDrafts.news}>Load draft</button>
            <button class="panel-button panel-button-primary" type="button" onclick={() => saveEditorDraft("news")}>Save local draft</button>
            <button class="panel-button" type="button" onclick={() => copyEditorExport("news")}>Copy JS module</button>
            <button class="panel-button panel-button-danger" type="button" onclick={() => clearEditorDraft("news")}>Clear draft</button>
        </div>
        {#if newsEditorMessage}
            <p class="editor-message">{newsEditorMessage}</p>
        {/if}
        {#if newsEditorError}
            <p class="error-text">{newsEditorError}</p>
        {/if}
        <textarea class="payload-editor" rows="18" bind:value={newsEditorText}></textarea>
    </section>

    <section class="panel-card">
        <h2>Effective DevCore Preview</h2>
        <div class="overview-grid">
            <article class="mini-card">
                <h3>Status type</h3>
                <p>{effectiveBasicApi.status?.type || "empty"}</p>
            </article>
            <article class="mini-card">
                <h3>Status text</h3>
                <p>{effectiveBasicApi.status?.text || "No active status message"}</p>
            </article>
            <article class="mini-card">
                <h3>Update cards</h3>
                <p>{effectiveUpdatesData.length}</p>
            </article>
            <article class="mini-card">
                <h3>Recent commits</h3>
                <p>{effectiveBasicApi.commits?.length || 0}</p>
            </article>
            <article class="mini-card">
                <h3>Homepage tag</h3>
                <p>{effectiveFrontpage.selectedTag || "None"}</p>
            </article>
        </div>
    </section>

    <section class="panel-card">
        <h2>Effective What's New Preview</h2>
        <div class="stack">
            {#each effectiveUpdatesData as update}
                <article class="mini-card">
                    <h3>{update.headline || "Untitled update"}</h3>
                    <p>{update.content || update.rawContent}</p>
                    <p><strong>Author:</strong> {update.authorName || "Unknown"}</p>
                    <p><strong>Timestamp:</strong> {Locale.timestampToDateWithTime(update.editedTimestamp || update.createdTimestamp)}</p>
                    {#if update.image}
                        <a href={update.image} target="_blank" rel="noreferrer">Open update image</a>
                    {/if}
                </article>
            {:else}
                <article class="mini-card">
                    <p>No current update is configured in the effective DevCore payload.</p>
                </article>
            {/each}
        </div>
    </section>

    <section class="panel-card">
        <h2>Effective DevCore News Preview</h2>
        <article class="mini-card">
            <p><strong>Title:</strong> {effectiveHomepageNews.title}</p>
            <p><strong>See more link:</strong> <a href={effectiveHomepageNews.seeMoreHref}>{effectiveHomepageNews.seeMoreHref}</a></p>
            <p><strong>Image:</strong> {effectiveHomepageNews.image.src}</p>
            <div class="stack tight">
                {#each effectiveHomepageNews.body as paragraph}
                    <p>{paragraph}</p>
                {/each}
            </div>
        </article>
    </section>

    <section class="panel-card">
        <h2>Effective Front Page Rails</h2>
        <div class="stack">
            {#each effectiveHomepageSections as section}
                <section class="section-block">
                    <div class="section-header">
                        <h3>{section.label}</h3>
                        <p>{section.items.length} projects</p>
                    </div>
                    <div class="project-grid">
                        {#each section.items as project}
                            <a class="project-card" href={buildSharedProjectPath(project.id)}>
                                <img
                                    src={PenguinModClient.projects.getProjectThumbnailURL(project.id)}
                                    alt={project.title}
                                />
                                <div class="project-copy">
                                    <h4>{project.title}</h4>
                                    <p>@{project.author?.username || "unknown"}</p>
                                    <p>ID: {project.id}</p>
                                </div>
                            </a>
                        {:else}
                            <article class="mini-card">
                                <p>No projects currently configured for this rail.</p>
                            </article>
                        {/each}
                    </div>
                </section>
            {/each}
        </div>
    </section>

    <section class="panel-card">
        <h2>Published Homepage Route Check</h2>
        <div class="overview-grid">
            <article class="mini-card">
                <h3>Published featured count</h3>
                <p>{publishedFrontpageData.featured.length}</p>
            </article>
            <article class="mini-card">
                <h3>Published voted count</h3>
                <p>{publishedFrontpageData.voted.length}</p>
            </article>
            <article class="mini-card">
                <h3>Published latest count</h3>
                <p>{publishedFrontpageData.latest.length}</p>
            </article>
            <article class="mini-card">
                <h3>Published homepage tag</h3>
                <p>{publishedFrontpageData.selectedTag || "None"}</p>
            </article>
        </div>
        {#if publishedFrontpageLoading}
            <p>Loading the currently published frontpage payload...</p>
        {:else if publishedFrontpageError}
            <p class="error-text">Failed to load the currently published frontpage payload.</p>
        {:else}
            <div class="stack">
                {#each publishedHomepageSections as section}
                    <article class="mini-card">
                        <h3>{section.label}</h3>
                        <p>{section.items.length} published projects</p>
                    </article>
                {/each}
            </div>
        {/if}
    </section>

    <section class="panel-card">
        <h2>Published What's New Route Check</h2>
        {#if publishedUpdatesLoading}
            <p>Loading the currently published updates payload...</p>
        {:else if publishedUpdatesError}
            <p class="error-text">Failed to load the currently published updates payload.</p>
        {:else}
            <div class="stack">
                {#each publishedUpdatesData as update}
                    <article class="mini-card">
                        <h3>{update.headline || "Untitled update"}</h3>
                        <p>{update.content || update.rawContent}</p>
                        <p><strong>Author:</strong> {update.authorName || "Unknown"}</p>
                        <p><strong>Timestamp:</strong> {Locale.timestampToDateWithTime(update.editedTimestamp || update.createdTimestamp)}</p>
                    </article>
                {:else}
                    <article class="mini-card">
                        <p>No update is currently published.</p>
                    </article>
                {/each}
            </div>
        {/if}
    </section>

    <section class="panel-card">
        <h2>Critical Repos By Runtime Role</h2>
        <div class="stack">
            {#each runtimeRepos.requiredByRole as role}
                <section class="section-block">
                    <div class="section-header section-header-stack">
                        <div>
                            <h3>{role.title}</h3>
                            <p>{role.description}</p>
                        </div>
                        <p>{role.repos.length} repos</p>
                    </div>
                    <div class="repo-grid">
                        {#each role.repos as repo}
                            <article class="repo-card">
                                <h3><a href={repo.repoUrl} target="_blank" rel="noreferrer">{repo.name}</a></h3>
                                <p>{repo.why}</p>
                                <p><strong>DevCore path:</strong> {repo.devcorePath || "Not copied in yet"}</p>
                            </article>
                        {/each}
                    </div>
                </section>
            {/each}
        </div>
    </section>

    <section class="panel-card two-col">
        <div>
            <h2>Phase Two Repos</h2>
            <div class="stack">
                {#each runtimeRepos.phaseTwo as repo}
                    <article class="mini-card">
                        <h3><a href={repo.repoUrl} target="_blank" rel="noreferrer">{repo.name}</a></h3>
                        <p>{repo.why}</p>
                        <p><strong>DevCore path:</strong> {repo.devcorePath || "Not copied in yet"}</p>
                    </article>
                {/each}
            </div>
        </div>
        <div>
            <h2>Archived Or Excluded Repos</h2>
            <div class="stack">
                {#each runtimeRepos.archivedOrExcluded as repo}
                    <article class="mini-card muted-card">
                        <h3><a href={repo.repoUrl} target="_blank" rel="noreferrer">{repo.name}</a></h3>
                        <p>{repo.why}</p>
                    </article>
                {/each}
            </div>
        </div>
    </section>

    {#if runtimeRepos.missingFromRepo.length > 0}
        <section class="panel-card">
            <h2>Needed Repos Still Missing From DevCore</h2>
            <div class="stack">
                {#each runtimeRepos.missingFromRepo as repo}
                    <article class="mini-card muted-card">
                        <h3><a href={repo.repoUrl} target="_blank" rel="noreferrer">{repo.name}</a></h3>
                        <p>{repo.why}</p>
                    </article>
                {/each}
            </div>
        </section>
    {/if}
</main>

<style>
    .panel-page {
        min-height: calc(100vh - 3rem);
        padding: 5rem 1.5rem 3rem;
        background:
            radial-gradient(circle at top left, rgba(39, 191, 36, 0.2), transparent 28rem),
            linear-gradient(180deg, rgba(255, 159, 26, 0.08), transparent 24rem),
            #f7fbf6;
        display: grid;
        gap: 1.25rem;
    }

    .panel-card {
        width: min(72rem, 100%);
        margin: 0 auto;
        padding: 1.5rem;
        border-radius: 1.25rem;
        background: rgba(255, 255, 255, 0.88);
        box-shadow: 0 20px 45px rgba(10, 26, 40, 0.12);
        line-height: 1.6;
    }

    .hero-card {
        background:
            linear-gradient(135deg, rgba(39, 191, 36, 0.14), rgba(255, 255, 255, 0.95)),
            rgba(255, 255, 255, 0.88);
    }

    .eyebrow {
        margin: 0;
        color: var(--devcore-topbar, #27bf24);
        font-size: 0.85rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }

    h1,
    h2,
    h3 {
        margin-block-start: 0;
    }

    h1 {
        margin: 0.35rem 0 1rem;
    }

    h2 {
        margin-bottom: 1rem;
    }

    .stack {
        display: grid;
        gap: 0.9rem;
    }

    .overview-grid,
    .project-grid {
        display: grid;
        gap: 0.9rem;
        grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
    }

    .tight {
        gap: 0.45rem;
    }

    .mini-card,
    .repo-card {
        padding: 1rem;
        border-radius: 1rem;
        background: rgba(39, 191, 36, 0.06);
        border: 1px solid rgba(39, 191, 36, 0.12);
    }

    .muted-card {
        background: rgba(16, 82, 20, 0.04);
        border-color: rgba(16, 82, 20, 0.12);
    }

    .repo-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
        gap: 0.9rem;
    }

    .section-block {
        display: grid;
        gap: 0.9rem;
    }

    .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }

    .section-header-stack {
        align-items: flex-start;
    }

    .section-header h3,
    .section-header p,
    .project-copy h4,
    .project-copy p {
        margin: 0;
    }

    .chip-row,
    .action-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.65rem;
    }

    .status-chip,
    .status-line {
        font-weight: 700;
        color: #175a22;
    }

    .status-chip {
        display: inline-flex;
        align-items: center;
        padding: 0.45rem 0.8rem;
        border-radius: 999px;
        background: rgba(39, 191, 36, 0.12);
    }

    .panel-button {
        padding: 0.7rem 0.95rem;
        border: 1px solid rgba(39, 191, 36, 0.18);
        border-radius: 0.85rem;
        background: rgba(247, 251, 247, 0.96);
        color: #12311a;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
        transition: transform 0.12s ease, box-shadow 0.12s ease;
    }

    .panel-button:hover {
        transform: translateY(-1px);
        box-shadow: 0 14px 24px rgba(10, 26, 40, 0.08);
    }

    .panel-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }

    .panel-button-primary {
        background:
            linear-gradient(135deg, rgba(39, 191, 36, 0.16), rgba(255, 159, 26, 0.12));
        border-color: rgba(39, 191, 36, 0.3);
    }

    .panel-button-danger {
        border-color: rgba(180, 35, 24, 0.2);
        color: #7a1f17;
    }

    .payload-editor {
        width: 100%;
        min-height: 16rem;
        padding: 1rem;
        border-radius: 1rem;
        border: 1px solid rgba(39, 191, 36, 0.16);
        background: rgba(250, 252, 249, 0.98);
        color: inherit;
        font: 0.95rem/1.5 Consolas, "Courier New", monospace;
        resize: vertical;
        box-sizing: border-box;
    }

    .panel-message,
    .editor-message {
        color: #175a22;
        font-weight: 700;
    }

    .project-card {
        display: grid;
        gap: 0.75rem;
        padding: 0.85rem;
        border-radius: 1rem;
        background: rgba(39, 191, 36, 0.08);
        border: 1px solid rgba(39, 191, 36, 0.14);
        color: inherit;
        text-decoration: none;
    }

    .project-card img {
        width: 100%;
        aspect-ratio: 4 / 3;
        object-fit: cover;
        border-radius: 0.75rem;
        background: rgba(16, 82, 20, 0.08);
    }

    .project-copy {
        display: grid;
        gap: 0.35rem;
    }

    .error-text {
        color: #b42318;
        font-weight: 700;
    }

    .two-col {
        display: grid;
        gap: 1.25rem;
        grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
    }

    a {
        color: var(--devcore-topbar, #27bf24);
        font-weight: 700;
    }

    :global(body.app-theme-dark) .panel-page {
        background:
            radial-gradient(circle at top left, rgba(39, 191, 36, 0.16), transparent 28rem),
            linear-gradient(180deg, rgba(255, 159, 26, 0.07), transparent 24rem),
            #111;
    }

    :global(body.app-theme-dark) .panel-card {
        background: rgba(17, 17, 17, 0.9);
        box-shadow: 0 20px 45px rgba(0, 0, 0, 0.35);
    }

    :global(body.app-theme-dark) .mini-card,
    :global(body.app-theme-dark) .repo-card,
    :global(body.app-theme-dark) .project-card,
    :global(body.app-theme-dark) .payload-editor,
    :global(body.app-theme-dark) .panel-button {
        background: rgba(27, 31, 27, 0.96);
        color: #f3fff1;
        border-color: rgba(84, 214, 98, 0.18);
    }

    :global(body.app-theme-dark) .hero-card {
        background:
            linear-gradient(135deg, rgba(39, 191, 36, 0.18), rgba(17, 17, 17, 0.94)),
            rgba(17, 17, 17, 0.9);
    }

    :global(body.app-theme-dark) .status-chip,
    :global(body.app-theme-dark) .status-line,
    :global(body.app-theme-dark) .panel-message,
    :global(body.app-theme-dark) .editor-message {
        color: #cbffcb;
    }

    :global(body.app-theme-dark) .status-chip {
        background: rgba(84, 214, 98, 0.16);
    }

    :global(body.app-theme-dark) .panel-button-primary {
        background:
            linear-gradient(135deg, rgba(39, 191, 36, 0.2), rgba(255, 159, 26, 0.16));
    }

    :global(body.app-theme-dark) .panel-button-danger {
        color: #ffc4bf;
    }

    @media (max-width: 720px) {
        .section-header {
            flex-direction: column;
            align-items: flex-start;
        }
    }
</style>
