import path from "path";
import app from "./app.json";
import { version } from "./src/version.json";

require("dotenv").config();

const versionFolder = version.replace(/\./g, "-");

import { DefinePlugin } from "webpack";

import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import FaviconsWebpackPlugin from "favicons-webpack-plugin";
import { GenerateSW } from "workbox-webpack-plugin";
import WebpackPwaManifest from "webpack-pwa-manifest";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import fs from "fs";

module.exports = (env, argv) => {
  const dirDist = path.resolve(__dirname, "dist");
  const dirSrc = path.resolve(__dirname, "src");
  const dev = argv.mode !== "production";
  const minify = !dev;
  const sourceMap = dev;

  let serveHttps = false;
  if (process.env.SSL_KEY && process.env.SSL_CRT && process.env.SSL_PEM) {
    serveHttps = {
      key: fs.readFileSync(process.env.SSL_KEY),
      cert: fs.readFileSync(process.env.SSL_CRT),
      ca: fs.readFileSync(process.env.SSL_PEM)
    };
  }

  return {
    entry: [
      `${dirSrc}/styles/app.scss`,
      "@babel/polyfill",
      `${dirSrc}/app/app.js`
    ],
    devServer: {
      contentBase: dirDist,
      compress: true,
      port: process.env.PORT || 8080,
      https: serveHttps,
      hot: true,
      historyApiFallback: true
    },
    output: {
      path: `${dirDist}`,
      filename: `assets/${versionFolder}/app-[hash].js`,
      publicPath: "/"
    },
    devtool: sourceMap ? `cheap-module-eval-source-map` : undefined,
    module: {
      rules: [
        {
          test: /\.svg$/,
          exclude: /node_modules/,
          loader: ["babel-loader", "vue-svg-loader"]
        },
        {
          test: /\.vue$/,
          loader: "vue-loader",
          exclude: /node_modules/
        },
        {
          test: /\.js$/,
          loader: "babel-loader",
          exclude: /node_modules/
        },
        {
          test: /\.(png|jpg|gif)$/,
          loader: "file-loader",
          options: {
            name: "[name].[ext]?[hash]"
          }
        },
        {
          test: /\.(s*)css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                hmr: process.env.NODE_ENV === "development"
              }
            },
            {
              loader: "css-loader",
              options: {
                url: false
              }
            },
            {
              loader: "postcss-loader",
              options: {
                plugins: () => [require("autoprefixer")]
              }
            },
            {
              loader: "sass-loader"
            },
            {
              loader: "@epegzz/sass-vars-loader",
              options: {
                syntax: "scss",
                files: [`${dirSrc}/settings.json`]
              }
            }
          ]
        }
      ]
    },
    resolve: {
      alias: {
        vue$: "vue/dist/vue.common.js",
        "@": dirSrc
      }
    },
    plugins: [
      new CleanWebpackPlugin({
        cleanStaleWebpackAssets: false
      }),
      new MiniCssExtractPlugin({
        filename: `assets/${versionFolder}/app-[hash].css`,
        chunkFilename: `assets/${versionFolder}/app-[id]-[hash].css`
      }),
      new CopyWebpackPlugin([
        {
          from: "src/.htaccess.example",
          to: "./.htaccess",
          toType: "file"
        },
        {
          from: "src/img/**/*",
          to: "./assets/img/",
          transformPath(targetPath, absolutePath) {
            return targetPath.replace("\\src\\img", "");
          }
        },
        {
          from: "src/fonts/*",
          to: "./assets/fonts/",
          flatten: true
        },
        {
          from: "src/version.json",
          to: "./version.json",
          toType: "file"
        }
      ]),
      new HtmlWebpackPlugin({
        //hash: true,
        title: app.title,
        description: app.description,
        template: "src/index.html",
        filename: "./index.html",
        chunksSortMode: "none",
        minify: minify
          ? {
              collapseWhitespace: true,
              removeComments: true,
              removeRedundantAttributes: true,
              removeScriptTypeAttributes: true,
              removeStyleLinkTypeAttributes: true,
              useShortDoctype: true
            }
          : false
      }),
      new FaviconsWebpackPlugin({
        logo: "./src/img/favicon.png",
        prefix: "assets/icon/[hash]/",
        emitStats: true,
        statsFilename: "assets/icon/iconstats-[hash].json",
        persistentCache: true,
        inject: true,
        background: app.colorbkg,
        title: app.title,
        icons: {
          android: true,
          appleIcon: true,
          appleStartup: true,
          coast: false,
          favicons: true,
          firefox: true,
          opengraph: false,
          twitter: true,
          yandex: false,
          windows: false
        }
      }),
      new WebpackPwaManifest({
        name: app.title,
        short_name: app.short,
        description: app.description,
        theme_color: app.color,
        background_color: app.colorbkg,
        crossorigin: "use-credentials", //can be null, use-credentials or anonymous
        fingerprints: false,
        icons: [
          {
            src: path.resolve("src/img/favicon.png"),
            sizes: [96, 128, 192, 256, 384, 512],
            destination: path.join("assets", "icon"),
            ios: true
          }
        ]
      }),
      new GenerateSW({
        importWorkboxFrom: "local",
        include: [/\.html$/, /\.js$/, /\.css$/],
        importsDirectory: "wb-assets",
        runtimeCaching: [
          {
            urlPattern: new RegExp("^https://api.mapbox.com/"),
            handler: "NetworkFirst",
            options: {
              cacheName: "api-mapbox-cache"
            }
          },
          {
            urlPattern: new RegExp(
              "^https://.wc-guide.com/(admin|ajax|api|css|files|fonts|img|js|mobile|xml)/"
            ),
            handler: "NetworkOnly"
          },
          {
            urlPattern: new RegExp(/\.(?:png|gif|jpg|svg|ico)$/),
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache"
            }
          },
          {
            urlPattern: new RegExp(/\.html$/),
            handler: "NetworkFirst",
            options: {
              cacheName: "index-cache"
            }
          }
        ],
        navigateFallback: "index.html",
        skipWaiting: true
      }),
      new DefinePlugin({
        API_BASE: JSON.stringify(
          process.env.API_BASE || "http://51.15.121.145/"
        ),
        USE_PWA: (JSON.stringify(process.env.USE_PWA) || "true") === "true"
      })
    ]
  };
};
