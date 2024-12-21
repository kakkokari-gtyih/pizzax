import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
    entries: [
        './src/index.ts',
        './src/vue/index.ts',
        './src/svelte/index.ts',
    ],
    externals: [
        'vue',
        'svelte',
    ],
    declaration: true,
    rollup: {
        emitCJS: true,
    },
});
