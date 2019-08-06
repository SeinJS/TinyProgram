/**
 * @File   : webpack.prod.config.js
 * @Author :  ()
 * @Date   : Wed Jul 31 2019
 * @Description: 
 */
const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const outPath = path.resolve(__dirname, 'dist');

module.exports = {
  entry: {
    main: path.resolve(__dirname, './src/index.tsx'),
    'seinjs': ['seinjs']
  },

  output: {
    path: outPath,
    filename: '[name].[hash].js',
    chunkFilename: '[name].chunk.[hash].js',
    publicPath: './'
  },

  resolve: {
    extensions: [".ts", ".tsx", ".js", ".md"]
  },

  externals: {
    'fs': true,
    'path': true,
  },
  
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.tsx?$/,
        use: [
          {
            loader: "awesome-typescript-loader"
          },
          {
            loader: 'tslint-loader',
            query: {
              configFile: path.resolve(__dirname, './tslintConfig.js')
            }
          }
        ],
        exclude: /node_modules/
      },
      {
        test: /\.(css|scss)$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader'
            },
            {
              loader: 'postcss-loader'
            },
            {
              loader: 'sass-loader'
            }
          ]
        }),
      },
      {
        test: /\.md$/,
        use: [
          {
            loader: 'raw-loader'
          }
        ]
      },
      {
        test: /\.(png|jpg|gif|svg|mp4)$/,
        use: {
          loader: 'url-loader',
          query: {
            limit: 15000
          }
        }
      },
      {
        test: /\.json$/,
        use: {
          loader: 'json-loader'
        }
      }
    ]
  },

  plugins: [
    new CleanWebpackPlugin(
      ['*'],
      {root: outPath}
    ),
    new CopyWebpackPlugin(
      [
        {
          from: path.resolve(__dirname, './src/assets'),
          to: path.resolve(__dirname, './dist/assets')
        }
      ]
    ),
    new ExtractTextPlugin({
      filename: 'main.[hash].css',
      allChunks: true
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: ['seinjs'],
      minChunks: 2
    }),
    new HtmlWebpackPlugin({
      template: './index.html'
    })
  ]
};
