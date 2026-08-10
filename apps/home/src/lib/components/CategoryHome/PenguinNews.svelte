<script>
    import { browser } from "$app/environment";

    // components
    import { Category } from "PenguinMod-SvelteUI";
    import Icon from "$lib/components/Icon/Component.svelte";
    import LocalizedString from "$lib/components/Localization/LocalizedString.svelte";
    
    import homepageNews from "$lib/content/dev-panel/homepage-news";
    import TranslationMapper from "$lib/resources/localization/translation/mapper";

    import StoreDevPanelDrafts from "$lib/stores/dev-panel-drafts";
    import StoreSettings from "$lib/stores/settings";

    let props = $props();
    const activeHomepageNews = $derived($StoreDevPanelDrafts.news || homepageNews);
</script>

<Category {...props}>
    <!-- DevCore News Category -->
    {#snippet header()}
        <LocalizedString
            text="DevCore News"
            key="home.sections.informational"
        />
    {/snippet}
    {#snippet headerSecondary()}
        <a
            href={activeHomepageNews.seeMoreHref}
            target={activeHomepageNews.seeMoreExternal ? "_blank" : undefined}
        >
            <LocalizedString
                text="See more"
                key="home.seemore"
            />
            {#if activeHomepageNews.seeMoreExternal}
                <Icon style="font-size:0.9rem;display:inline">
                    open_in_new
                </Icon>
            {/if}
        </a>
    {/snippet}
    <div>
        <h2 style="margin-block:4px;">
            {activeHomepageNews.title}
        </h2>
        <div style="width:100%">
            {#each activeHomepageNews.body as paragraph}
                <p>{paragraph}</p>
            {/each}
            {#each activeHomepageNews.inlineLinks as link}
                <a href={link.href} target="_blank">
                    {link.label}
                </a>
            {/each}
        </div>
        <hr />
        <img
            src={activeHomepageNews.image.src}
            alt={activeHomepageNews.image.alt}
            style="width:100%;border-radius:8px;"
        />
    </div>
    {#snippet footer()}
        {#if browser && TranslationMapper.mapSavedLanguageCode($StoreSettings.appLanguage) !== "en"}
            {activeHomepageNews.footer.untranslated}
        {:else}
            {activeHomepageNews.footer.default}
        {/if}
    {/snippet}
</Category>

<style>
    a,
    a:link,
    a:visited,
    a:hover,
    a:focus,
    a:active {
        color: var(--devcore-green-700, #19871a) !important;
        font-weight: 700;
    }
</style>
