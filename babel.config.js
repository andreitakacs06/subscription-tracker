// Babel config for Expo SDK 54.
// Reanimated 4 ships its worklets plugin via the `react-native-worklets`
// package. It MUST be the last plugin in the list.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-worklets/plugin'],
  };
};
