const path = require("path");
const CopyWebpackPlugin = require('copy-webpack-plugin');

const ASSET_PATH = process.env.ASSET_PATH || '/';

module.exports = {
    entry: "./src/index.js",
    mode: 'development',
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist"),
    },
    module: {
        rules: [
            {
                test: /\.s[ac]ss$/i,
                use: [
                    // Creates `style` nodes from JS strings
                    "style-loader",
                    // Translates CSS into CommonJS
                    "css-loader",
                    // Compiles Sass to CSS
                    "sass-loader",
                ],
            }
        ]
    },
    devtool: 'inline-source-map',
    devServer: {
        static: './dist',
        hot: true,
    },
    plugins: [
        // This makes it possible for us to safely use env vars on our code
        new CopyWebpackPlugin({
            patterns: [
                {from: 'public', to: ''}
            ]
        })
    ],
    // optimization: {
    //     runtimeChunk: 'single',
    // },
}