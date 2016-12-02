const webpack = require('webpack');
const path = require('path');

module.exports = {
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "moment": "moment"
    })
  ],
  entry: {
    main: "./lib/index.js",
    test: "mocha!./test/index.js"
  },
  output: {
    path: __dirname,
    filename: "[name].bundle.js"
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: '/node_modules/', loader: 'babel-loader'},
      { test: /\.css$/, loader: "style!css" },
      { test: /\.scss$/, loader: "style!css!sass" },
      { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192' }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.json', '.scss', '.css']
  }
}
