// webpack.config.js

const path = require('path');
const fs = require("fs");
const webpack = require('webpack');
const LiveReloadPlugin = require('webpack-livereload-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const {styles} = require('@ckeditor/ckeditor5-dev-utils');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const marked = require('marked');
const pkg = require('./package.json');

function getPackageVersion(packageName) {
  const yarnParser = require('parse-yarn-lockfile');
  const yarnLock = yarnParser.parse(fs.readFileSync("yarn.lock", { encoding: "utf-8" }));

  if (yarnLock.type !== 'success') {
    return null;
  }

  const libraries = yarnLock.object;
  for (const library in libraries) {
    if (library.startsWith(packageName + '@')) {
      return libraries[library].version;
    }
  }

  return null;
}

function getChangelog() {
  const changelog = fs.readFileSync("CHANGELOG.md", { encoding: "utf-8" });
  return marked.parse(changelog);
}

const isDevMode = process.env.NODE_ENV !== 'production';

const CKEditorCSSRegex = /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/;
const CKEditorSVGRegex = /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/;

const publicPath = './';

module.exports = {
  devtool: 'source-map',
  entry: './src/index.js',
  resolve: {
    extensions: ['.js'],
    alias: {
      jquery: 'jquery/src/jquery',
    },
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build'),
    publicPath: publicPath,
    clean: true,
  },
  performance: {
    hints: false,
  },
  resolveLoader: {
    modules: ['node_modules', path.resolve(__dirname, 'loaders')],
  },
  module: {
    rules: [
      {
        test: CKEditorSVGRegex,
        use: ['raw-loader']
      },
      {
        test: CKEditorCSSRegex,
        use: [
          {
            loader: 'style-loader',
            options: {
              injectType: 'singletonStyleTag',
              attributes: {
                'data-cke': true
              }
            }
          },
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: styles.getPostCssConfig({
                themeImporter: {
                  themePath: require.resolve('@ckeditor/ckeditor5-theme-lark')
                },
                minify: true
              })
            }
          }
        ]
      },
      {
        test: /\.css$/,
        exclude: CKEditorCSSRegex,
        use: [
          //MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
        ]
      },
      {
        test: /\.scss$/,
        use: [
          isDevMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          // Order of postcss-loader and resolve-url-loader matters.
          // See: https://github.com/postcss/postcss-loader/issues/340
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                config: 'postcss.config.js'
              },
            }
          },
          'resolve-url-loader',
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                sourceMap: true,
                sourceMapContents: false
              },
            },
          },
        ]
      },
      {
        test: /\.(jpe?g|png|gif|avif|svg)$/i,
        exclude: CKEditorSVGRegex,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name].[ext]'
        }
      },
      {
        test: /\.(eot|woff2?|ttf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[hash][ext][query]'
        }
      },
      {
        test: /\.txt$/,
        type: 'asset/source',
      },
      {
        test: /\.words$/,
        use: [
          {
            loader: 'betomat-dictionary-words-loader',
            options: {
              excludedWords: ['nie'],
            }
          }
        ],
      },
    ]
  },
  optimization: {
    minimizer: [
      `...`,
      new CssMinimizerPlugin(),
    ],
  },
  plugins: [
    new CssMinimizerPlugin(),
    new MiniCssExtractPlugin(),
    new webpack.DefinePlugin({
      BASEPATH: JSON.stringify(''),
      IS_DEV_MODE: isDevMode,
    }),
    new LiveReloadPlugin({
      protocol: 'http',
      hostname: 'localhost',
      port: 35729,
      appendScriptTag: true,
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      publicPath: publicPath,
      version: pkg.version,
      versionPlugin: getPackageVersion('betomat-plugin-ckeditor5'),
      repositoryUrl: 'https://github.com/lukasz-zaroda/betomat-website.git',
      repositoryPluginUrl: 'https://github.com/lukasz-zaroda/betomat-plugin-ckeditor5.git',
      buildTime: new Intl.DateTimeFormat('pl-PL', {
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric',
        hour12: false,
        timeZone: 'Europe/Warsaw',
      }).format(),
      build: process.env.NETLIFY ? process.env.BUILD_ID : 'unknown',
      changelog: getChangelog(),
    }),
  ],
};
