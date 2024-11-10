const NodemonPlugin = require("nodemon-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");
const Dotenv = require("dotenv-webpack");

const isProduction = process.env.NODE_ENV == "production";

const config = {
  entry: "./src/index.ts",
  target: "node",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: "svg-url-loader",
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js"],
  },
  externalsPresets: { node: true },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: "./src/proxy/help.txt" }],
    }),
    ,
    new NodemonPlugin(),
    new Dotenv(),
  ],
};

module.exports = () => {
  if (isProduction) {
    config.mode = "production";
  } else {
    config.mode = "development";
  }
  return config;
};
