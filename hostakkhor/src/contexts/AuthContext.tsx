import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Linking } from 'react-native';
import queryString from 'query-string';
import { SSO_SERVER_URL, CLIENT_ID } from '@env';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: IUser | null;
  login: () => void;
  logout: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<boolean>;
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

  const REDIRECT_URL = "hostakkhor://auth";

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
      console.log('Fetched user details:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  };

  const fetchUserProfile = async (token: string) => {
    if (!token) {
      console.error('Token is missing. Cannot fetch user profile.');
      throw new Error('Token is missing');
    }

    try {
      // Get SSO profile
      const response = await axios.get(`${SSO_SERVER_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('SSO User profile response:', response.data);
      const ssoUserData = response.data;
      
      // Fetch internal user details
      const internalUserDetails = await fetchUserDetails(ssoUserData.email);
      console.log('Internal user details:', internalUserDetails);
      const internalUser = internalUserDetails?.result?.[0]?.value;

      // Generate or use existing internal ID
      const internalId = internalUser?.id || generateUniqueId();
      const userPath = `hostakkhor_users_${internalId}`;
      
      // Combine both profiles, ensuring we keep both IDs and all necessary fields
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

      console.log('Combined user data:', combinedUserData);

      // Save the combined user data
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

      const { token, user: ssoUser } = response.data;

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
  console.log('Starting signup process...', { email, name });
  
  try {
    const response = await axios.post(`${SSO_SERVER_URL}/api/auth/register`, {
      email,
      password,
      name,
      token: CLIENT_ID,
      redirectUrl: REDIRECT_URL,
    });

    console.log('Signup response status:', response.status);
    console.log('Signup response data:', JSON.stringify(response.data, null, 2));

    if (response.data.token) {
      console.log('Token received, proceeding with user profile fetch...');
      const { token } = response.data;
      await AsyncStorage.setItem('authToken', token);
      setToken(token);
      await fetchUserProfile(token);
      console.log('Signup process completed successfully');
      return true;
    }

    console.error('No token in response');
    return false;
  } catch (error: any) {
    console.error('Signup error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });
    throw error;
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