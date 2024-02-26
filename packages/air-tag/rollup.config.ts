// rollup.config.js
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import path from 'path'

const isProd = process.env.NODE_ENV === 'production';
const version = require('./package.json').version;

export default {
    input: 'src/index.ts',
    output: {
        name: 'layoutLego',
        file: isProd ? `dist/history/air_tag_${version}.min.js` : `dist/air_tag.min.js`,
        format: "umd",
    },
    plugins: [
        nodeResolve({
            jsnext: true,
            main: true,
            browser: true,
        }),
        commonjs(),
        alias({
            entries: [
                { find: '@utils', replacement: path.resolve(__dirname, './src/utils/index.ts') },
                { find: '@plugins', replacement: path.resolve(__dirname, 'src/plugins/index.ts') },
                { find: '@core', replacement: path.resolve(__dirname, 'src/core/index.ts') }
            ]
        }),
        typescript({
            tsconfig: path.resolve(__dirname, './tsconfig.json'),
            "allowImportingTsExtensions": true,
            "noEmit": true
        }),
        replace({
            preventAssignment: true,
            __VERSION__: version,
            __BUILD__TIME__: Date.now().toString(),
        }),
        terser({
            ecma: 5,
            safari10: true,
            compress: {
                drop_console: true,
            },
            format: {
                comments: false,
            }
        })
    ]
};
