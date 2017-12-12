var path = require('path');
var webpack = require('webpack');
var precss = require('precss');
var autoprefixer = require('autoprefixer');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  devtool: 'eval',
  entry: [
    './src/index.jsx'
  ],
  output: {
    path: path.join(__dirname, 'assets'),
    filename: 'bundle.min.js'
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    }),
    new ExtractTextPlugin('bundle.min.css', { allChunks: true })
  ],
  module: {
    loaders: [
      { test: /\.jsx$/, loaders: ['babel'], include: path.join(__dirname, 'src') },
      { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader!postcss-loader') },
      { test: /\.png$/, loader: 'url-loader?limit=100000&name=img/[name].[ext]' },
      { test: /\.gif$/, loader: 'url-loader?limit=100000&name=img/[name].[ext]' },
      { test: /\.jpg$/, loader: 'file-loader?name=img/[name].[ext]' },
      { test: /\.(ttf|eot|svg|woff(2)?)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader?name=fonts/[name].[ext]' }
    ]
  },
  postcss: function () {
    return [precss, autoprefixer];
  }
};
