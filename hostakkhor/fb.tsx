import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Linking, Platform } from 'react-native';
import queryString from 'query-string';
import { LoginManager, AccessToken, Settings } from 'react-native-fbsdk-next';
import { SSO_SERVER_URL, CLIENT_ID, REDIRECT_URL } from '@env';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: IUser | null;
  logout: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<boolean>;
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

  // Facebook SDK initialization
  useEffect(() => {
    try {
      Settings.initializeSDK();
      console.log('[AuthContext] Facebook SDK initialized');
    } catch (err) {
      console.error('[AuthContext] Facebook SDK initialization error:', err);
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
        console.log('[AuthContext] Stored token:', storedToken);
        if (storedToken) {
          setToken(storedToken);
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setIsAuthenticated(true);
            console.log('[AuthContext] Loaded user from storage:', parsedUser);
          } else {
            await fetchUserProfile(storedToken);
          }
        }
      } catch (error) {
        // Log initialization error
        console.error('[AuthContext] Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  useEffect(() => {
    const handleLink = async ({ url }: { url: string }) => {
      try {
        // Debug: log incoming deep links
        console.log('[AuthContext] Handling deep link:', url);
        const parsedUrl = queryString.parseUrl(url);
        const authToken = parsedUrl.query.auth_token as string;
        if (authToken) {
          setLoading(true);
          await AsyncStorage.setItem('authToken', authToken);
          setToken(authToken);
          await fetchUserProfile(authToken);
          setIsAuthenticated(true);
          console.log('[AuthContext] Got auth token from deep link:', authToken);
        }
      } catch (error) {
        // Log deep link error
        console.error('[AuthContext] Deep link error:', error);
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
      // Log fetched user details
      console.log('[AuthContext] Fetched user details:', response.data);
      return response.data;
    } catch (error) {
      // Log error
      console.error('[AuthContext] Error fetching user details:', error);
      return null;
    }
  };

  const fetchUserProfile = async (token: string) => {
    if (!token) {
      console.error('[AuthContext] Token is missing. Cannot fetch user profile.');
      throw new Error('Token is missing');
    }
    try {
      // Log start of user profile fetch
      console.log('[AuthContext] Fetching SSO profile with token:', token);
      const response = await axios.get(`${SSO_SERVER_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('[AuthContext] SSO User profile response:', response.data);
      const ssoUserData = response.data;
      
      // Fetch internal user details
      const internalUserDetails = await fetchUserDetails(ssoUserData.email);
      console.log('[AuthContext] Internal user details:', internalUserDetails);
      const internalUser = internalUserDetails?.result?.[0]?.value;

      // Generate or use existing internal ID
      const internalId = internalUser?.id || generateUniqueId();
      const userPath = `hostakkhor_users_${internalId}`;

      // Combine both profiles
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

      // Log combined user data
      console.log('[AuthContext] Combined user data:', combinedUserData);

      setUser(combinedUserData);
      await AsyncStorage.setItem('user', JSON.stringify(combinedUserData));

      // Update or create internal user record
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
      console.log('[AuthContext] User profile fetch/update complete');
    } catch (error: any) {
      // Log error during profile fetch
      console.error('[AuthContext] Error fetching user profile:', error);
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
      // Log logout success
      console.log('[AuthContext] Logged out');
    } catch (error) {
      // Log logout error
      console.error('[AuthContext] Logout error:', error);
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
      // Log request data
      console.log('[AuthContext] signInWithEmail requestData:', requestData);
      const url = `${SSO_SERVER_URL}/api/auth/login`;
      const response = await axios.post(url, requestData);
      const { token, user: ssoUser } = response.data;
      // Log response
      console.log('[AuthContext] signInWithEmail response:', response.data);

      await AsyncStorage.setItem('authToken', token);
      setToken(token);
      await fetchUserProfile(token);

      return true;
    } catch (error) {
      // Log sign-in error
      console.error('[AuthContext] Error during sign-in:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Log sign-up start
      console.log('[AuthContext] Starting signUpWithEmail:', { email, name });
      const response = await axios.post(`${SSO_SERVER_URL}/api/auth/register`, {
        email,
        password,
        name,
        token: CLIENT_ID,
        redirectUrl: REDIRECT_URL,
      });
      // Log response
      console.log('[AuthContext] signUpWithEmail response:', response.data);

      if (response.data.token) {
        const { token } = response.data;
        await AsyncStorage.setItem('authToken', token);
        setToken(token);
        await fetchUserProfile(token);
        return true;
      }
      return false;
    } catch (error: any) {
      // Log sign-up error
      console.error('[AuthContext] Signup error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithFacebook = async (): Promise<boolean> => {
    setLoading(true);
    try {
      // Log FB login start
      console.log('[AuthContext] Attempting Facebook login...');
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
      console.log('[AuthContext] Facebook login result:', result);
      if (result.isCancelled) {
        console.log('[AuthContext] Facebook login cancelled by user');
        setLoading(false);
        return false;
      }
      // Get current access token
      const data = await AccessToken.getCurrentAccessToken();
      console.log('[AuthContext] AccessToken.getCurrentAccessToken() result:', data);
      if (!data || !data.accessToken) {
        console.log('[AuthContext] Failed to get Facebook access token');
        setLoading(false);
        throw new Error('Failed to get access token from Facebook');
      }
      // Log FB access token
      console.log('[AuthContext] Facebook access token:', data.accessToken);

      // Send to SSO server backend
      const response = await axios.post(`${SSO_SERVER_URL}/api/auth/facebook`, {
        accessToken: data.accessToken,
        token: CLIENT_ID,
        redirectUrl: REDIRECT_URL,
      });
      // Log SSO backend response
      console.log('[AuthContext] Facebook SSO backend response:', response.data);

      if (response.data.token) {
        await AsyncStorage.setItem('authToken', response.data.token);
        setToken(response.data.token);
        await fetchUserProfile(response.data.token);
        setLoading(false);
        return true;
      }
      setLoading(false);
      return false;
    } catch (error) {
      setLoading(false);
      // Log Facebook login error
      console.error('[AuthContext] Facebook login error:', error);
      throw error;
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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};