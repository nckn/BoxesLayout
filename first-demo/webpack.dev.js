const merge = require('webpack-merge')
const common = require('./webpack.common.js')
const webpack = require('webpack')
const path = require('path');

module.exports = merge(common, {
  mode: 'development',
  devServer: {
    contentBase: './',
    hot: true,
    open: true,
    port: 9000
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.glsl$/,
        loader: 'webpack-glsl-loader'
      }
    ]
  },
  resolve: {
    alias: {
      Scripts: path.resolve(__dirname, './src/scripts/')
    }
  },
  plugins: [new webpack.HotModuleReplacementPlugin()]
})
