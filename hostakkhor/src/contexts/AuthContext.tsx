import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Linking } from 'react-native';
import queryString from 'query-string';
import { SSO_SERVER_URL, CLIENT_ID } from '@env';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  login: () => void;
  logout: () => Promise<void>;
  signInWithEmail: (Email: string, password: string) => Promise<boolean>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<boolean>;
  loading: boolean;
  fetchUserDetails: (email: string) => Promise<any>;
  fetchUserProfile: (token: string) => Promise<void>;
}

interface IUser {
  id?: string;
  name?: string;
  email: string;
  ssoProfileImageUrl?: string;
  profileImageUrl?: string;
  created_at?: number;
  updated_at?: number;
  path?: string;
  bio?: string;
  pinnedPostTheme?: 'default' | 'golden';
  onboardingCompleted?: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
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

    Linking.getInitialURL().then((url) => {
      if (url) handleLink({ url });
    });

    return () => {
      sub.remove(); // Ensure cleanup
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
      const response = await axios.get(`${SSO_SERVER_URL}/api/user/profile`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
  
      console.log('User profile response:', response.data);
  
      const userData = response.data;
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
  
      // Fetch additional user details
      await fetchUserDetails(userData.email);
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
  
      // Handle 401 error
      if (error.response?.status === 401) {
        console.warn('Token is invalid or expired. Logging out the user.');
        await AsyncStorage.multiRemove(['authToken', 'user']);
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      }
  
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

  const signInWithEmail = async (Email: string, password: string) => {
    setLoading(true);
    try {
      const requestData = {
        email: Email,
        password: password,
        token: CLIENT_ID,
        redirectUrl: REDIRECT_URL
      };
  
      const url = `${SSO_SERVER_URL}/api/auth/login`;
  
      console.log('Sending login request to:', url);
      console.log('Login request body:', requestData);
  
      const response = await axios.post(url, requestData);
  
      const { token, user } = response.data;
  
      await AsyncStorage.setItem('authToken', token);
      setToken(token);
      setUser(user);
      setIsAuthenticated(true);
  
      await fetchUserDetails(user.email);
  
      return true;
    } catch (error) {
      console.error('Error during sign-in:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };  

  const signUpWithEmail = async (email: string, password: string, fullName: string): Promise<boolean> => {
    if (!fullName) {
      console.error("Full name is required for signup");
      return false;
    }
  
    try {
      // Debug logging for request
      console.log('Sending signup request to:', `${SSO_SERVER_URL}/api/auth/register`);
      console.log('Signup request body:', { email, password, name: fullName, token, redirectUrl: REDIRECT_URL });
  
      const response = await axios.post(`${SSO_SERVER_URL}/api/auth/register`, {
        email,
        password,
        name: fullName,
        token, // Token from app state or configuration
        redirectUrl: REDIRECT_URL,
      });
  
      if (response.data.success) {
        const { token, user } = response.data;
  
        // Save user and token in local storage
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
  
        // Update context state
        setToken(token);
        setUser(user);
        setIsAuthenticated(true);
  
        return true;
      } else {
        console.error("Signup failed:", response.data.error);
        return false;
      }
    } catch (error) {
      console.error("Signup error details:", { message: error.message, response: error.response });
      throw error; // Re-throw to handle in the calling function
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