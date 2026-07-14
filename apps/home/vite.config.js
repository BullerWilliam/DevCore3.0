import path from 'path';

import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
    optimizeDeps: {
        include: [
            'PenguinMod-SvelteUI',
            '@asamuzakjp/css-color',
            '@devcore/theme',
            'lottie-web',
            'penguinmod'
        ],
        force: true
    },
    ssr: {
        external: [
            'penguinmod'
        ],
    },
    server: {
        watch: {
            ignored: [
                '!**/packages/svelte-ui/**'
            ]
        }
    },
    resolve: {
        alias: {
            'PenguinMod-SvelteUI': path.resolve('../../packages/svelte-ui/src/lib/index.js'),
            '@asamuzakjp/css-color': path.resolve('./node_modules/@asamuzakjp/css-color'),
            'lottie-web': path.resolve('./node_modules/lottie-web')
        }
    }
});
