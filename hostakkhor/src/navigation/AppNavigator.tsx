import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import SignInScreen from '../screens/SignInScreen';
import HomeScreen from '../screens/HomeScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CreatePost from '../screens/CreatePosts';
import CreatePage from '../screens/CreatePages';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../styles/globalStyles';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.white,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: colors.black,
        headerTitleStyle: {
          fontFamily: 'Roboto-Medium',
          fontSize: 18,
        },
        cardStyle: { backgroundColor: colors.white },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SignIn" component={SignInScreen} options={{ title: 'Sign In' }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false, title: 'My Profile' }} />
      <Stack.Screen name="CreatePost" component={CreatePost} />
      <Stack.Screen name="CreatePage" component={CreatePage} />
    </Stack.Navigator>
  );
};

export default AppNavigator;