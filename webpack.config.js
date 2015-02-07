var fs = require('fs');
var path = require('path');

var _ = require('lodash-node');
var packageJson = require('./package.json');
var webpack = require('webpack');

module.exports = getConfig();

module.exports.getConfig = getConfig;

function getConfig(env) {
  env = env || 'dev';
  var dev = env === 'dev';
  var test = env === 'test';
  var prod = env === 'prod';

  var plugins = {
    prod: [
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
  plugins.test = plugins.prod;

  var config = {
    context: here('src'),
    entry: test ? './index.test.js' : './index.js',
    output: {
      library: 'apiCheck',
      libraryTarget: 'umd',
      filename: dev ? 'apiCheck.js' : 'apiCheck.min.js',
      path: here('dist'),
      pathinfo: dev
    },


    stats: {
      colors: true,
      reasons: true
    },

    devtool: prod ? 'source-map' : 'inline-source-map',

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
        {test: /\.js$/, loader: '6to5!jshint', exclude: /node_modules/}
      ]
    }
  };

  console.log('Config is in ' + env + ' mode');
  return config;
}


function getBanner() {
  return '// apiCheck.js v' + packageJson.version + ' built with ♥ by Kent C. Dodds (ó ì_í)=óò=(ì_í ò)\n';
}

function here(p) {
  return path.join(__dirname, p || '');
}
