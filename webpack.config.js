const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CssMinimizer = require("css-minimizer-webpack-plugin");

module.exports = {
    mode: process.env.mode,
    entry: "./src/index.tsx",
    output: {
        path: path.resolve(__dirname, "dist"), // string (default)
        filename: "bundle.js", // string (default)
        publicPath: "/assets/", // string
        library: {
            type: "umd",
            name: "MyLibrary",
        },
        uniqueName: "my-application"
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                include: [
                    path.resolve(__dirname, "src")
                ],
                loader: "ts-loader",
                type: "javascript/auto",
            },
            {
                rules: [
                    {
                        test: /\.css$/i,
                        use: ['style-loader', 'css-loader'],
                    },
                    {
                        test: /\.(png|svg|jpg|jpeg|gif)$/i,
                        type: 'asset/resource',
                    },
                    {
                        test: /\.(woff|woff2|eot|ttf|otf)$/i,
                        type: 'asset/resource',
                    },
                ]
            },
        ],
    },
    resolve: {
        // // options for resolving module requests
        // // (does not apply to resolving of loaders)
        // modules: ["node_modules", path.resolve(__dirname, "src")],
        // // directories where to look for modules (in order)
        extensions: [".ts",".tsx",".js"],
    },
    performance: {
        hints: "warning", // 枚举
        maxAssetSize: 200000, // 整数类型（以字节为单位）
        maxEntrypointSize: 400000, // 整数类型（以字节为单位）
        assetFilter: function (assetFilename) {
            // 提供资源文件名的断言函数
            return assetFilename.endsWith('.css') || assetFilename.endsWith('.js');
        }
    },
    devtool: process.env.mode === 'development'?'inline-source-map':"source-map", // enum
    // 通过为浏览器调试工具提供极其详细的源映射的元信息来增强调试能力，
    // 但会牺牲构建速度。
    context: __dirname,
    target: "web",
    externals: ["react"],
    ignoreWarnings: [/warning/],
    watchOptions: {
        ignored: /node_modules/,
    },
    stats: {
        preset: "errors-only",
        env: true,
        outputPath: true,
        publicPath: true,
        assets: true,
        entrypoints: true,
        chunkGroups: true,
        chunks: true,
        modules: true,
        children: true,
        logging: true,
        loggingDebug: /webpack/,
        loggingTrace: true,
        warnings: true,
        errors: true,
        errorDetails: true,
        errorStack: true,
        moduleTrace: true,
        builtAt: true,
        errorsCount: true,
        warningsCount: true,
        timings: true,
        version: true,
        hash: true
    },
    devServer: {
        proxy: {
            '/api': 'http://localhost:3000'
        },
        static: path.join(__dirname, 'public'),
        compress: true,
        historyApiFallback: true,
        hot: true,
        https: false,
    },
    experiments: {
        asyncWebAssembly: true,
        syncWebAssembly: true,
        outputModule: true,
        topLevelAwait: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'fly-pro',
        }),
    ],
    optimization: {
        chunkIds: "size",
        moduleIds: "size",
        mangleExports: "size",
        minimize: process.env.mode === 'production',
        minimizer: [new CssMinimizer(), "..."],
        splitChunks: {
            cacheGroups: {
                "my-name": {
                    test: /\.sass$/,
                    type: "css/mini-extract",
                }
            },
            fallbackCacheGroup: {
            }
        }
    }
}
