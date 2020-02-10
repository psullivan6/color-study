module.exports = function(api) {
  if (api != null) {
    api.cache(true);
  }

  return {
    presets: ['@babel/preset-env']
  };
};
