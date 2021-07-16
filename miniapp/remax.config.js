module.exports = {
  configWebpack({ config, webpack, addCSSRule }) {
    config.resolve.symlinks(false);
  },
};
