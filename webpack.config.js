const path = require('path');
const webpack = require('webpack');




module.exports = {
  mode: 'development',
  plugins: [new webpack.ProgressPlugin()],
  devtool: 'source-map',

  module: {
    rules: []
  },

  devServer: {
    open: true,
    host: 'localhost'
  }
}