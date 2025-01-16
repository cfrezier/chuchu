const path = require('path');
module.exports = {
    entry: "/browser/player/index.ts",
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, '../../static/js/player')
    },
    resolve: {
        extensions: [".webpack.js", ".web.js", ".ts", ".js"]
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                enforce: "pre",
                use: ["source-map-loader"],
            },
            {test: /\.ts$/, loader: "ts-loader"}
        ]
    },
    devtool: 'source-map',
    mode: "development"
}