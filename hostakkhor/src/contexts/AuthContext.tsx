import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Linking } from 'react-native';
import queryString from 'query-string';
import {
  SSO_SERVER_URL,
  CLIENT_ID,
  REDIRECT_URL,
  GOOGLE_OAUTH_WEB_CLIENT_ID,
  GOOGLE_OAUTH_SCOPES,
  FACEBOOK_APP_ID,
  FACEBOOK_CLIENT_TOKEN
} from '@env';

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { AccessToken, LoginManager, Settings as FBSettings } from 'react-native-fbsdk-next';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: IUser | null;
  login: () => void;
  logout: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  signInWithFacebook: () => Promise<boolean>;
  loading: boolean;
  fetchUserDetails: (email: string) => Promise<any>;
  fetchUserProfile: (token: string) => Promise<void>;
}

interface IUser {
  id: string;           // Internal app ID
  ssoId: string;        // SSO ID
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

  // SDK initialization
  useEffect(() => {
    try {
      if (GOOGLE_OAUTH_WEB_CLIENT_ID) {
        GoogleSignin.configure({
          webClientId: GOOGLE_OAUTH_WEB_CLIENT_ID,
          scopes: GOOGLE_OAUTH_SCOPES ? GOOGLE_OAUTH_SCOPES.split(',') : ['profile', 'email'],
          offlineAccess: true,
        });
      }
      FBSettings.initializeSDK();
    } catch (e) {
      console.log("SDK init error", e);
    }
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
      // Update or create internal user record
      const key = userPath;
      await fetch('https://proxy.hostakkhor.com/proxy/putjson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: combinedUserData }),
      });
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  };

  const login = () => {
    const loginUrl = `${SSO_SERVER_URL}/login?token=${CLIENT_ID}&redirect_url=${REDIRECT_URL}`;
    Linking.openURL(loginUrl);
  };

  const logout = async () => {
    setLoading(true);
    try {
      await AsyncStorage.multiRemove(['authToken', 'user']);
      setToken(null);
      setIsAuthenticated(false);
      setUser(null);
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
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  // SOCIAL LOGIN FUNCTIONS
  const signInWithGoogle = async (): Promise<boolean> => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      const response = await axios.post(`${SSO_SERVER_URL}/api/auth/google`, {
        token: CLIENT_ID,
        redirectUrl: REDIRECT_URL,
        user: {
          id: userInfo.user.id,
          name: userInfo.user.name,
          email: userInfo.user.email,
          photo: userInfo.user.photo,
        },
        idToken: tokens.idToken,
      });
      if (response.data.token) {
        await AsyncStorage.setItem('authToken', response.data.token);
        setToken(response.data.token);
        await fetchUserProfile(response.data.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Google sign-in error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signInWithFacebook = async (): Promise<boolean> => {
    setLoading(true);
    try {
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
      if (result.isCancelled) {
        setLoading(false);
        return false;
      }
      const data = await AccessToken.getCurrentAccessToken();
      if (!data?.accessToken) {
        setLoading(false);
        throw new Error('No Facebook access token');
      }
      const response = await axios.post(`${SSO_SERVER_URL}/api/auth/facebook`, {
        accessToken: data.accessToken,
        token: CLIENT_ID,
        redirectUrl: REDIRECT_URL,
      });
      if (response.data.token) {
        await AsyncStorage.setItem('authToken', response.data.token);
        setToken(response.data.token);
        await fetchUserProfile(response.data.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Facebook sign-in error:', error);
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
        login,
        logout,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInWithFacebook,
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
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};