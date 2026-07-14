<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { browser } from "$app/environment";

    // Components
    import Footer from "$lib/Footer/Component.svelte";
    import Logo from "$lib/Logo/Component.svelte";

    import stateApplication from "$lib/state/app.svelte.js";
</script>

<div class="top">
    <div class="header">
        <Logo />
        <h1>PenguinMod</h1>
    </div>
</div>
<div class="buffer">
    <p>We are currently experiencing some issues on this part of the website.</p>
    <p>You can still use the link below to enter the project editor.</p>
</div>

<div class="buffer">
    <p><a href="https://studio.penguinmod.com/editor.html">Editor</a></p>

    <Footer />
    <div style="height: 64px"></div>
</div>

<style>
    :global(body.dark-mode) {
        color: white;
    }

    .top {
        width: 100%;

        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .header {
        display: flex;
        align-items: center;
        flex-direction: row;

        font-size: 1.35em;
    }

    .buffer {
        width: 80%;
        margin-left: 10%;

        display: flex;
        flex-direction: column;
        align-items: center;
    }
</style>
