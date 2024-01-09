const path = require("path");

module.exports = {
  entry: "./src/MkvDemuxer.js",
  mode: "production",
  output: {
    library: "MkvDemuxer",
    libraryTarget: "umd2",
    path: path.resolve(__dirname, "dist"),
    filename: "MkvDemuxer.js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            sourceType: "script",
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: {
                    browsers: ["last 2 versions", "> 1%", "not ie <= 11"],
                  },
                },
              ],
            ],
            plugins: [
              [
                "@babel/plugin-transform-runtime",
                {
                  helpers: true,
                  regenerator: true,
                },
              ],
            ],
          },
        },
      },
    ],
  },
};
