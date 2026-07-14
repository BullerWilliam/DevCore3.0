<script>
    import { page } from "$app/state";

    // Components
    import NavigationBar from "$lib/NavigationBar/Component.svelte";
    
    import stateApplication from '$lib/state/app.svelte.js';

    let props = $props();
</script>

<NavigationBar
    displaySearchBar={false}
/>
<div style="height: 3rem;"></div>

{@render props.children?.()}
