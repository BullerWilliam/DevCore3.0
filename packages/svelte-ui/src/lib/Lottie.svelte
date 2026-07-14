<script>
    // NOTE: for some reason we have to do this ugly mess for typings
    import * as _lottie from 'lottie-web';
    /** @type {import("lottie-web").LottiePlayer} */
    const lottie = _lottie.default;

    /**
     * @callback AnimationCallback
     * @param {import("lottie-web").AnimationItem} animation
     * @returns {void}
     */
    /**
     * @typedef {Object} Properties
     * @property {string?} src Lottie src to display
     * @property {boolean?} autoplay
     * @property {number|boolean?} loop
     * @property {number?} speed
     * @property {import("lottie-web").AnimationSegment?} initialSegment
     * @property {AnimationCallback} animationRef Get a reference to the Lottie AnimationItem.
     */
    /** @type {Properties} */
    const props = $props();

    let container;
    let loaded = $state(false);
    $effect(() => {
        const animation = lottie.loadAnimation({
            container: container,
            renderer: 'svg',

            path: props.src,
            autoplay: props.autoplay,
            loop: props.loop,
            speed: props.speed,
            initialSegment: props.initialSegment,
        });
        if (typeof props.speed === "number") animation.setSpeed(props.speed);
        animation.addEventListener("error", () => {
            loaded = false;
        });
        animation.addEventListener("DOMLoaded", () => {
            loaded = true;
        });

        if (props.animationRef) props.animationRef(animation);
        return () => animation.destroy();
    });
</script>

<div
    {...props}
    class="lottie"
    data-penguinmodsvelteui-lottie="true"
    bind:this={container}
>
    {#if !loaded}
        <div
            class="lottie-placeholder"
            data-penguinmodsvelteui-lottie-placeholder="true"
        >
            {@render props.children?.()}
        </div>
    {/if}
</div>

<style>
    .lottie {
        position: relative;
    }
    .lottie-placeholder {
        position: absolute;
    }
</style>