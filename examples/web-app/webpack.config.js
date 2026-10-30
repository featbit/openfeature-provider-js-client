const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

const baseConfig = {
    entry: {
        ['index']: './src/index.ts',
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: `[name].js`,
        libraryTarget: 'umd',
        umdNamedDefine: true,
        globalObject: 'this',
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                extractComments: false,
                terserOptions: {
                    format: {
                        comments: /@preserve|@license|@cc_on|^!/i,
                    },
                },
            }),
        ],
    },
};

const config = {
    ...baseConfig, output: {
        path: path.resolve(__dirname, 'lib'),
        filename: `[name].js`,
        libraryTarget: 'umd',
        umdNamedDefine: true,
        // prevent error: `Uncaught ReferenceError: self is not define`
        globalObject: 'this',
    }
};

module.exports = [
    config
];
