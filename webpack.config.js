var path = require('path');
var webpack = require('webpack');


module.exports = {  
  entry: { 
    index: "./src/index.ts"
  },
  target: 'web',
  module: {
    loaders: [
      { test: /\.ts(x?)$/, loader: 'ts-loader' },      
      { test: /\.json$/, loader: 'json-loader' }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({minimize: true})
  ],
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
  output: {
    path: path.join(__dirname),
    filename: 'cssUsage.src.js'
  },
};