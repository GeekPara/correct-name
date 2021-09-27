export default {
    entry: "./index.js",
    target: 'node',
    mode: 'production',
    loader: {
        test: /\.html$/,
        loader: 'html-loader'
    }
}
