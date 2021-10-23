const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
    .BundleAnalyzerPlugin

const config = {
    entry: './src/index.tsx',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.html$/,
                use: 'html-loader'
            }
        ],
    },
    plugins: [],
    // devtool: 'inline-source-map',
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist')
    },
    devServer: {
        host: '0.0.0.0',
        contentBase: path.resolve(__dirname, 'dist'),
        compress: true,
        port: 80,
    },
};
config.plugins.push(new BundleAnalyzerPlugin())
module.exports = config