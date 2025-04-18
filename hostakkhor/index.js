/**
 * @format
 */

// index.js
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';  // Changed from './src/App' to './App'
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);