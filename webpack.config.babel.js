import path from 'path';
import LiveReloadPlugin from 'webpack-livereload-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import FaviconsWebpackPlugin from 'favicons-webpack-plugin';
import {GenerateSW} from 'workbox-webpack-plugin';
import WebpackPwaManifest from 'webpack-pwa-manifest'
import CleanWebpackPlugin from 'clean-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const DIST_DIR = path.resolve(__dirname, "dist");
const SRC_DIR = path.resolve(__dirname, "src");

const config = {
	entry: [
		`${SRC_DIR}/styles/app.scss`,
		`${SRC_DIR}/app/app.js`
	],
	output: {
		path: `${DIST_DIR}`,
		filename: "assets/app-[hash].js",
		publicPath: '/'
	},
	module: {
		rules: [
			{
				test: /\.svg$/,
				exclude: /node_modules/,
				use: 'raw-loader'
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
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: [
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
									`${SRC_DIR}/settings.json`
								]
							}
						}
					]
				})
			},
		]
	},
	resolve: {
		alias: {
			'vue$': 'vue/dist/vue.common.js'
		}
	},
	devtool: '#eval-source-map',
	plugins: [
		new CleanWebpackPlugin(['dist']),
		new ExtractTextPlugin({
			filename: 'assets/app-[hash].css'
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
					return targetPath.replace('src/img/', '');
				},
			}, {
				from: 'src/fonts/*',
				to: './assets/fonts/',
				flatten: true
			}, {
				from: 'src/version.json',
				to: './version.json',
				toType: 'file'
			}
		]),
		new LiveReloadPlugin(),
		new HtmlWebpackPlugin({
			//hash: true,
			title: 'WC-Guide: Irgendwann musst auch Du',
			description: 'WC-Guide ist das grösste Verzeichnis öffentlicher Toiletten der Schweiz.',
			template: 'src/index.html',
			filename: './index.html'
		}),
		new FaviconsWebpackPlugin({
			logo: './src/img/favicon.png',
			prefix: 'assets/icon/[hash]/',
			emitStats: true,
			statsFilename: 'assets/icon/iconstats-[hash].json',
			persistentCache: true,
			inject: true,
			background: '#A8956E',
			title: 'WC-Guide',
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
			name: 'WC-Guide: Irgendwann musst auch Du',
			short_name: 'WC-Guide',
			description: 'WC-Guide ist das grösste Verzeichnis öffentlicher Toiletten der Schweiz.',
			theme_color: '#a7956f',
			background_color: '#A8956E',
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
					handler: 'staleWhileRevalidate',
					options: {
						cacheName: 'api-image-cache'
					}
				}, {
					urlPattern: new RegExp('^https://api\.mapbox\.com/'),
					handler: 'staleWhileRevalidate',
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