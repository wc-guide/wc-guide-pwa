import path from 'path';
import app from './app.json';
import {version} from './src/version.json';

const versionFolder = version.replace(/\./g, '-');

import LiveReloadPlugin from 'webpack-livereload-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import FaviconsWebpackPlugin from 'favicons-webpack-plugin';
import {GenerateSW} from 'workbox-webpack-plugin';
import WebpackPwaManifest from 'webpack-pwa-manifest'
import {CleanWebpackPlugin} from 'clean-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const dirDist = path.resolve(__dirname, "dist");
const dirSrc = path.resolve(__dirname, "src");
const env = process.env.NODE_ENV;
const minify = env === 'production';
const sourceMap = env === 'development';

const config = {
	entry: [
		`${dirSrc}/styles/app.scss`,
		`${dirSrc}/app/app.js`
	],
	output: {
		path: `${dirDist}`,
		filename: `assets/${versionFolder}/app-[hash].js`,
		publicPath: '/'
	},
	devtool: sourceMap ? `cheap-module-eval-source-map` : undefined,
	module: {
		rules: [
			{
				test: /\.svg$/,
				exclude: /node_modules/,
				loader: 'vue-svg-loader',
			},
			{
				test: /\.vue$/,
				loader: 'vue-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: /node_modules/
			},
			{
				test: /\.(png|jpg|gif)$/,
				loader: 'file-loader',
				options: {
					name: '[name].[ext]?[hash]'
				}
			},
			{
				test: /\.(s*)css$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
						options: {
							hmr: process.env.NODE_ENV === 'development',
						},
					},
					{
						loader: 'css-loader',
						options: {
							url: false
						}
					},
					{
						loader: 'postcss-loader',
						options: {
							plugins: () => [require('autoprefixer')]
						}
					},
					{
						loader: 'sass-loader'
					},
					{
						loader: "@epegzz/sass-vars-loader",
						options: {
							syntax: 'scss',
							files: [
								`${dirSrc}/settings.json`
							]
						}
					}
				]
			},
		]
	},
	resolve: {
		alias: {
			'vue$': 'vue/dist/vue.common.js',
			'@': dirSrc
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
				from: 'src/.htaccess.example',
				to: './.htaccess',
				toType: 'file'
			}, {
				from: 'src/img/**/*',
				to: './assets/img/',
				transformPath(targetPath, absolutePath) {
					return targetPath.replace('\\src\\img', '');
				},
			}, {
				from: 'src/fonts/*',
				to: './assets/fonts/',
				flatten: true
			}, {
				from: 'src/content/**/*',
				to: './content/',
				transformPath(targetPath, absolutePath) {
					return targetPath.replace('\\src\\content', '');
				},
			}, {
				from: 'src/version.json',
				to: './version.json',
				toType: 'file'
			}
		]),
		new LiveReloadPlugin(),
		new HtmlWebpackPlugin({
			//hash: true,
			title: app.title,
			description: app.description,
			template: 'src/index.html',
			filename: './index.html',
			chunksSortMode: 'none',
			minify: minify ? {
				collapseWhitespace: true,
				removeComments: true,
				removeRedundantAttributes: true,
				removeScriptTypeAttributes: true,
				removeStyleLinkTypeAttributes: true,
				useShortDoctype: true,
			} : false
		}),
		new FaviconsWebpackPlugin({
			logo: './src/img/favicon.png',
			prefix: 'assets/icon/[hash]/',
			emitStats: true,
			statsFilename: 'assets/icon/iconstats-[hash].json',
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
			crossorigin: 'use-credentials', //can be null, use-credentials or anonymous
			fingerprints: false,
			icons: [
				{
					src: path.resolve('src/img/favicon.png'),
					sizes: [96, 128, 192, 256, 384, 512],
					destination: path.join('assets', 'icon'),
					ios: true
				}
			]
		}),
		new GenerateSW({
			importWorkboxFrom: 'local',
			include: [/\.html$/, /\.js$/, /\.css$/],
			importsDirectory: 'wb-assets',
			runtimeCaching: [
				{
					urlPattern: new RegExp('^https://wc-guide\.sayhello\.dev/wp-content/uploads/'),
					handler: 'cacheFirst',
					options: {
						cacheName: 'api-image-cache'
					}
				}, {
					urlPattern: new RegExp('^https://wc-guide\.sayhello\.dev/wp-json/'),
					handler: 'networkFirst',
					options: {
						cacheName: 'api-rest-cache'
					}
				}, {
					urlPattern: new RegExp('^https://api\.mapbox\.com/'),
					handler: 'networkFirst',
					options: {
						cacheName: 'api-mapbox-cache'
					}
				}, {
					urlPattern: new RegExp(/\.(?:png|gif|jpg|svg|ico)$/),
					handler: 'cacheFirst',
					options: {
						cacheName: 'image-cache'
					}
				}, {
					urlPattern: new RegExp(/\.html$/),
					handler: 'networkFirst',
					options: {
						cacheName: 'index-cache'
					}
				}
			],
			navigateFallback: 'index.html',
			skipWaiting: true,
		})
	]
};

module.exports = config;