const withCSS = require('@zeit/next-css');

module.exports = withCSS({
  // eslint-disable-line no-undef
  publicRuntimeConfig: {
    HOST: process.env.HOST
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.module.rules.push({
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        options: {
          // eslint options (if necessary)
        }
      });
    }
    return config;
  }
});
