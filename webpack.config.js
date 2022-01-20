/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

const globule = require("globule");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const pugFiles = globule.find("src/pug/*.pug", {
  ignore: ["src/pug/_*.pug"],
});

const enabledSourceMap = true;
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
        test: /\.s[ac]ss$/i,
        use: [
          // linkタグに出力する機能
          "style-loader",
          // CSSをバンドルするための機能
          {
            loader: "css-loader",
            options: {
              // オプションでCSS内のurl()メソッドの取り込みを禁止する
              url: false,
              // ソースマップの利用有無
              sourceMap: enabledSourceMap,

              // 0 => no loaders (default);
              // 1 => postcss-loader;
              // 2 => postcss-loader, sass-loader
              importLoaders: 2,
            },
          },
          {
            loader: "sass-loader",
            options: {
              // ソースマップの利用有無
              sourceMap: enabledSourceMap,
            },
          },
        ],
      },
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
