import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator } from 'react-native';
import WelcomeScreen from '../screens/WelcomeScreen';
import SignInScreen from '../screens/SignInScreen';
import HomeScreen from '../screens/HomeScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CreatePost from '../screens/CreatePosts';
import CreatePage from '../screens/CreatePages';
import PostDetailsScreen from '../screens/PostScreen';
import PagesScreen from '../screens/PagesScreen'; // Make sure to import this
import EditPage from '../screens/EditPage'; // Import the EditPage screen
import EditPostScreen from '../screens/EditPost'; // Import the PostEdit screen
import { RootStackParamList } from '../types/navigation';
import { colors } from '../styles/globalStyles';
import { useAuth } from '../contexts/AuthContext';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName="Home"
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
      <Stack.Screen 
        name="Welcome" 
        component={WelcomeScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="SignIn" 
        component={SignInScreen} 
        options={{ title: 'Sign In' }} 
      />
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ headerShown: false, gestureEnabled: false }} 
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'My Profile' }} 
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen} 
        options={{ title: 'Edit Profile' }} 
      />
      <Stack.Screen 
        name="EditPage" 
        component={EditPage} 
        options={{ title: 'Edit Page' }} 
      />
      <Stack.Screen 
        name="CreatePost" 
        component={CreatePost} 
        options={{ title: 'Create Post' }} 
      />
      <Stack.Screen 
        name="CreatePage" 
        component={CreatePage} 
        options={{ title: 'Create Page' }} 
      />
      <Stack.Screen 
        name="PostDetail" 
        component={PostDetailsScreen}
        options={{ title: 'Post Details' }} 
      />
      <Stack.Screen 
        name="PostEdit" 
        component={EditPostScreen} // Use the EditPostScreen component for editing
        options={{ title: 'Edit Post' }} 
      />
      <Stack.Screen 
        name="Pages" 
        component={PagesScreen}
        options={{ title: 'Page Details' }} 
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;