import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Linking, Alert } from 'react-native';
import queryString from 'query-string';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { 
  SSO_SERVER_URL, 
  REDIRECT_URL,
  CLIENT_ID, 
  GOOGLE_OAUTH_WEB_CLIENT_ID, 
  GOOGLE_OAUTH_SCOPES 
} from '@env';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: IUser | null;
  logout: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  loading: boolean;
  fetchUserDetails: (email: string) => Promise<any>;
  fetchUserProfile: (token: string) => Promise<void>;
}

interface IUser {
  id: string;
  ssoId: string;
  name: string;
  email: string;
  ssoProfileImageUrl?: string;
  profileImageUrl?: string;
  created_at: number;
  updated_at: number;
  path: string;
  bio: string;
  pinnedPostTheme: 'default' | 'golden';
  onboardingCompleted: boolean;
  role: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

const generateUniqueId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `${timestamp}-${random}`;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_OAUTH_WEB_CLIENT_ID,
      scopes: GOOGLE_OAUTH_SCOPES.split(','),
      offlineAccess: true,
    });
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem('authToken'),
          AsyncStorage.getItem('user'),
        ]);

        if (storedToken) {
          setToken(storedToken);

          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setIsAuthenticated(true);
          } else {
            await fetchUserProfile(storedToken);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    const handleLink = async ({ url }: { url: string }) => {
      try {
        const parsedUrl = queryString.parseUrl(url);
        const authToken = parsedUrl.query.auth_token as string;

        if (authToken) {
          setLoading(true);
          await AsyncStorage.setItem('authToken', authToken);
          setToken(authToken);
          await fetchUserProfile(authToken);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Deep link error:', error);
      } finally {
        setLoading(false);
      }
    };

    const subscription = Linking.addEventListener('url', handleLink);

    Linking.getInitialURL().then((url) => {
      if (url) handleLink({ url });
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const fetchUserDetails = async (email: string) => {
    try {
      const url = `https://proxy.hostakkhor.com/proxy/getsorted?keys=hostakkhor_users_*&skip=0&limit=50&filter=${encodeURIComponent(JSON.stringify({ where: { email: { eq: email } } }))}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  };

  const fetchUserProfile = async (token: string) => {
    if (!token) throw new Error('Token is missing');
    try {
      const response = await axios.get(`${SSO_SERVER_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ssoUserData = response.data;
      const internalUserDetails = await fetchUserDetails(ssoUserData.email);
      const internalUser = internalUserDetails?.result?.[0]?.value;
      const internalId = internalUser?.id || generateUniqueId();
      const userPath = `hostakkhor_users_${internalId}`;

      const combinedUserData: IUser = {
        id: internalId,
        ssoId: ssoUserData.id,
        email: ssoUserData.email,
        name: ssoUserData.name || internalUser?.name || 'Anonymous',
        profileImageUrl: internalUser?.profileImageUrl || ssoUserData.profileImageUrl || '',
        ssoProfileImageUrl: ssoUserData.profileImageUrl || '',
        created_at: internalUser?.created_at || Date.now(),
        updated_at: Date.now(),
        path: userPath,
        bio: internalUser?.bio,
        pinnedPostTheme: internalUser?.pinnedPostTheme || "default",
        onboardingCompleted: internalUser?.onboardingCompleted || false,
        role: 'user'
      };

      setUser(combinedUserData);
      await AsyncStorage.setItem('user', JSON.stringify(combinedUserData));

      // Save/update internal user record
      const key = userPath;
      await fetch('https://proxy.hostakkhor.com/proxy/putjson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key,
          value: combinedUserData
        }),
      });

      setIsAuthenticated(true);
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await AsyncStorage.multiRemove(['authToken', 'user']);
      setToken(null);
      setIsAuthenticated(false);
      setUser(null);
      await GoogleSignin.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const requestData = {
        email,
        password,
        token: CLIENT_ID,
        redirectUrl: REDIRECT_URL,
      };

      const url = `${SSO_SERVER_URL}/api/auth/login`;
      const response = await axios.post(url, requestData);

      const { token } = response.data;

      await AsyncStorage.setItem('authToken', token);
      setToken(token);
      await fetchUserProfile(token);

      return true;
    } catch (error) {
      console.error('Error during sign-in:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const response = await axios.post(`${SSO_SERVER_URL}/api/auth/register`, {
        email,
        password,
        name,
        token: CLIENT_ID,
        redirectUrl: REDIRECT_URL,
      });

      if (response.data.token) {
        const { token } = response.data;
        await AsyncStorage.setItem('authToken', token);
        setToken(token);
        await fetchUserProfile(token);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async (): Promise<boolean> => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const googleSignInResult = await GoogleSignin.signIn();
      if (googleSignInResult.type !== 'success') {
        Alert.alert('Google sign-in cancelled');
        return false;
      }
      const userObj = googleSignInResult.data.user;
      const idToken = googleSignInResult.data.idToken;

      console.log('Google user object:', userObj);
      console.log('Google ID token:', idToken);

      if (!userObj || !userObj.id || !idToken) {
        throw new Error('Google user object or idToken missing. Try again.');
      }

      // Send Google token and user info to SSO server
      const response = await axios.post(`https://sso.hostakkhor.com/api/auth/google`, {
        token: CLIENT_ID,
        redirectUrl: REDIRECT_URL,
        user: {
          id: userObj.id,
          name: userObj.name,
          email: userObj.email,
          photo: userObj.photo,
        },
        idToken: idToken,
      });

      console.log('SSO server response:', response.data);

      const { token } = response.data;
      await AsyncStorage.setItem('authToken', token);
      setToken(token);
      await fetchUserProfile(token);

      return true;
    } catch (error: any) {
      console.error('Google Sign-In failed:', error);
      Alert.alert('Google Sign-In Failed', error.message || 'Could not sign in with Google');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        token,
        user,
        logout,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        loading,
        fetchUserDetails,
        fetchUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};