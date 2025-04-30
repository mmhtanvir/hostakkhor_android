import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Linking } from 'react-native';
import queryString from 'query-string';
import { SSO_SERVER_URL, CLIENT_ID } from '@env'; // Ensure these environment variables are properly set

// Define the shape of the authentication context
interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  login: () => void;
  logout: () => Promise<void>;
  fetchUserProfile: (token: string) => Promise<void>;
  loading: boolean;
}

// Define the shape of the user object
interface User {
  id: string;
  name?: string;
  email: string;
  profileImageUrl: string | null;
  createdAt: string;
}

// Create the authentication context
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const REDIRECT_URL = "hostakkhor://auth"; // This matches the SSO server configuration

  // Initialize auth state from AsyncStorage
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
            setUser(JSON.parse(storedUser));
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

  // Handle deep linking for SSO callback
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

    const sub = Linking.addEventListener('url', handleLink);

    // Handle cold start deep link
    Linking.getInitialURL().then((url) => {
      if (url) handleLink({ url });
    });

    return () => sub.remove();
  }, []);

  // Fetch user profile based on the token
  const fetchUserProfile = async (token: string) => {
    try {
      console.log('Fetching user profile with token:', token);
      const response = await axios.get(`${SSO_SERVER_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const userData = response.data;
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error: any) {
      console.error('Error fetching user profile:', error.response?.data || error.message);

      if (error.response?.status === 401) {
        // Clear invalid token and user data
        await AsyncStorage.multiRemove(['authToken', 'user']);
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      }

      throw error;
    }
  };

  // Login method: redirect to SSO server
  const login = () => {
    const encodedRedirectUrl = encodeURIComponent(REDIRECT_URL);
    const loginUrl = `${SSO_SERVER_URL}/login?client_id=${CLIENT_ID}&redirect_url=${encodedRedirectUrl}`;
    console.log('Redirecting to login URL:', loginUrl);
    Linking.openURL(loginUrl);
  };

  // Logout method: clear token and user data
  const logout = async () => {
    setLoading(true);
    try {
      // Clear token and user data
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

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        token,
        user,
        login,
        logout,
        fetchUserProfile, // Added fetchUserProfile here
        loading
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