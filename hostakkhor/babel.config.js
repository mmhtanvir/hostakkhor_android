module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
      safe: false,
      allowUndefined: true,
    }],
<<<<<<< HEAD
    'react-native-reanimated/plugin', // MUST BE LAST
=======
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
  ],
};