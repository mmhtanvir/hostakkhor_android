import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src//navigation/AppNavigator';
import { StatusBar } from 'react-native';
import { colors } from './src/styles/globalStyles';
import { Settings } from 'react-native-fbsdk-next';

Settings.initializeSDK();

const App = () => {
  return (
      <SafeAreaProvider>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.white}
        />
        <AuthProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
  );
};

export default App;