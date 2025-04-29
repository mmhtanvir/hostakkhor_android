import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Linking } from 'react-native';
import queryString from 'query-string';
import { SSO_SERVER_URL, CLIENT_ID } from '@env'; // Ensure these environment variables are properly set

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  login: () => void;
  logout: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<boolean>;
  loading: boolean;
}

interface User {
  id: string;
  name?: string;
  email: string;
  profileImageUrl: string | null;
  createdAt: string;
}

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
        // Use query-string to parse the URL
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

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await axios.get(`${SSO_SERVER_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const userData = response.data;
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error: any) {
      console.error('Error fetching user profile:', error);

      if (error.response?.status === 401) {
        await AsyncStorage.multiRemove(['authToken', 'user']);
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      }

      throw error;
    }
  };

  const login = () => {
    const loginUrl = `${SSO_SERVER_URL}/login?token=${CLIENT_ID}&redirect_url=${(REDIRECT_URL)}`;
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
      const response = await axios.post(`${SSO_SERVER_URL}/auth/login`, { email, password });
      const { token, user } = response.data;

      await AsyncStorage.setItem('authToken', token);
      setToken(token);
      setUser(user);
      setIsAuthenticated(true);

      return true;
    } catch (error) {
      console.error('Error during sign-in:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    try {
      const response = await axios.post(`${SSO_SERVER_URL}/auth/register`, {
        email,
        password,
        name: fullName
      });

      const { token: authToken, user: userData } = response.data;

      await AsyncStorage.setItem('authToken', authToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      setToken(authToken);
      setUser(userData);
      setIsAuthenticated(true);

      return true;
    } catch (error) {
      console.error('Sign up error:', error);
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