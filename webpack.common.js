const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const path = require('path');

module.exports = {
    context: __dirname, // to automatically find tsconfig.json
    entry: './src/client.ts',
    output: {
        path: path.resolve(__dirname, 'public', 'dist'),
        filename: 'bundle.js', // string    // the filename template for entry chunks
        publicPath: '/dist/', // string    // the url to the output directory resolved relative to the HTML page
    },
    resolve: {
        extensions: ['.ts', '.js', '.sass', '.css'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    // disable type checker - we will use it in fork plugin
                    transpileOnly: true
                }
            },
            {
                test: /\.sass$/,
                use: [
                    'style-loader', // creates style nodes from JS strings
                    'css-loader', // translates CSS into CommonJS
                    'sass-loader' // compiles Sass to CSS, using Node Sass by default
                ]
            }
        ]
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin()
    ]
};