import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
    entries: [
        './src/index.ts',
        './src/vue/index.ts',
    ],
    externals: [
        'vue',
    ],
    declaration: true,
    rollup: {
        emitCJS: true,
    },
});
