<script>
    import { browser } from "$app/environment";

    // components
    import { Category } from "PenguinMod-SvelteUI";
    import Icon from "$lib/components/Icon/Component.svelte";
    import LocalizedString from "$lib/components/Localization/LocalizedString.svelte";
    
    import homepageNews from "$lib/content/dev-panel/homepage-news";
    import TranslationMapper from "$lib/resources/localization/translation/mapper";

    import StoreSettings from "$lib/stores/settings";

    let props = $props();
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
            href={homepageNews.seeMoreHref}
            target={homepageNews.seeMoreExternal ? "_blank" : undefined}
        >
            <LocalizedString
                text="See more"
                key="home.seemore"
            />
            {#if homepageNews.seeMoreExternal}
                <Icon style="font-size:0.9rem;display:inline">
                    open_in_new
                </Icon>
            {/if}
        </a>
    {/snippet}
    <div>
        <h2 style="margin-block:4px;">
            {homepageNews.title}
        </h2>
        <div style="width:100%">
            {#each homepageNews.body as paragraph}
                <p>{paragraph}</p>
            {/each}
            {#each homepageNews.inlineLinks as link}
                <a href={link.href} target="_blank">
                    {link.label}
                </a>
            {/each}
        </div>
        <hr />
        <img
            src={homepageNews.image.src}
            alt={homepageNews.image.alt}
            style="width:100%;border-radius:8px;"
        />
    </div>
    {#snippet footer()}
        {#if browser && TranslationMapper.mapSavedLanguageCode($StoreSettings.appLanguage) !== "en"}
            {homepageNews.footer.untranslated}
        {:else}
            {homepageNews.footer.default}
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
