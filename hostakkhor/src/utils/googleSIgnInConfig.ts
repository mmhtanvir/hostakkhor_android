  import { GoogleSignin } from '@react-native-google-signin/google-signin';
  
  export const configureGoogleSignIn = () => {
    GoogleSignin.configure({
      webClientId: process.env.GOOGLE_OAUTH_WEB_CLIENT_ID!,
      offlineAccess: true,
      scopes: ['profile', 'email'],
    });
  };