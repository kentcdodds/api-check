var path = require('path');

var _ = require('lodash-node');
var packageJson = require('./package.json');
var webpack = require('webpack');

var env = process.env.NODE_ENV || 'development';
var dev = env === 'development';
var test = env === 'test';
var prod = env === 'production';

var plugins = {
  production: [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ],
  commonPost: [
    new webpack.BannerPlugin(getBanner(), {raw: true})
  ]
};
plugins.test = plugins.production;

var config = {
  context: here('src'),
  entry: test ? './index.test.js' : './index.js',
  output: {
    library: 'apiCheck',
    libraryTarget: 'umd',
    filename: dev ? 'api-check.js' : 'api-check.min.js',
    path: here('dist'),
    pathinfo: dev
  },


  stats: {
    colors: true,
    reasons: true
  },

  devtool: prod ? 'source-map' : undefined,

  plugins: _.filter(_.union(plugins[env], plugins.commonPost)),

  resolve: {
    extensions: ['', '.js']
  },

  resolveLoader: {
    modulesDirectories: ['webpack/loaders', 'node_modules'],
    root: here()
  },

  externals: {},

  module: {
    loaders: [
      {test: /\.js$/, loader: 'babel!jshint', exclude: /node_modules/}
    ]
  },
  jshint: {
    failOnHint: true,
    emitErrors: true
  }
};

console.log('Config is in ' + env + ' mode');
module.exports = config;


function getBanner() {
  return '// apiCheck.js v' + packageJson.version + ' built with ♥ by Kent C. Dodds (ó ì_í)=óò=(ì_í ò)\n';
}

function here(p) {
  return path.join(__dirname, p || '');
}
