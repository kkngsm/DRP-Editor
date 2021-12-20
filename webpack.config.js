/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

const globule = require("globule");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const pugFiles = globule.find("src/pug/*.pug", {
  ignore: ["src/pug/_*.pug"],
});

const setting = {
  mode: "development",

  entry: "./src/ts/main.ts",
  output: {
    //  出力ファイルのディレクトリ名
    path: `${__dirname}/dist`,
    // 出力ファイル名
    filename: "main.js",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
      },
      {
        test: /\.pug$/,
        use: [
          {
            loader: "pug-loader",
            options: {
              pretty: true,
              root: `${__dirname}/src/pug`,
            },
          },
        ],
      },
      {
        test: /\.(glsl|vs|fs|vert|frag)$/,
        exclude: /node_modules/,
        use: ["raw-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  plugins: [],
};

pugFiles.forEach((pug) => {
  const html = pug.split("/").slice(-1)[0].replace(".pug", ".html");
  setting.plugins.push(
    new HtmlWebpackPlugin({
      inject: false,
      filename: `${__dirname}/dist/${html}`,
      template: pug,
    })
  );
});

module.exports = setting;
