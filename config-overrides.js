const webpack = require('webpack');
const { override, addWebpackPlugin } = require('customize-cra');

module.exports = function override(config, env) {
  config.resolve.fallback = { 
    ...config.resolve.fallback,
    stream: require.resolve('stream-browserify'),
    buffer: require.resolve('buffer/'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    url: require.resolve('url/'),
    timers: require.resolve('timers-browserify'),
    process: require.resolve('process/browser'),
    Buffer: require.resolve('buffer/')
  };

  addWebpackPlugin(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    })
  )(config, env);

  return config;
};