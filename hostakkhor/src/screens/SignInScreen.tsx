import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SvgUri } from 'react-native-svg';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

const SignInScreen = () => {
  const navigation = useNavigation();
  const { login, signInWithEmail, signUpWithEmail, loading } = useAuth();
  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }

    if (!isSignIn) {
      if (!formData.fullName) {
        Alert.alert('Error', 'Please provide your full name');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (isSignIn) {
        const success = await signInWithEmail(formData.email, formData.password);
        if (success) {
          navigation.navigate('Home');
        }
      } else {
        const success = await signUpWithEmail(formData.email, formData.password, formData.fullName);
        if (success) {
          navigation.navigate('Home');
        }
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Authentication failed. Please try again.'
      );
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={globalStyles.scrollContainer} 
      keyboardShouldPersistTaps="handled"
    >
      <View style={globalStyles.authContainer}>
        <View style={globalStyles.logoContainer}>
          <SvgUri
            width="80"
            height="80"
            uri="https://files.hostakkhor.com/download/711dffc3-3e8f-4b55-ad6b-f43a2eed6c2e-hotakkhor-logo.svg"
          />
          <Text style={globalStyles.appName}>Hostakkhor</Text>
        </View>

        <Text style={globalStyles.authTitle}>
          {isSignIn ? 'Sign in to your account' : 'Create Account'}
        </Text>

        <View style={globalStyles.socialContainer}>
          <TouchableOpacity
            style={[globalStyles.socialButton, globalStyles.googleButton]}
            activeOpacity={0.8}
            onPress={login}
            disabled={loading}
          >
            <Image
              source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }}
              style={globalStyles.socialIcon}
            />
            <Text style={globalStyles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[globalStyles.socialButton, globalStyles.facebookButton]}
            onPress={login}
            disabled={loading}
          >
            <Icon name="facebook" size={20} color="#fff" style={globalStyles.socialIconLeft} />
            <Text style={globalStyles.facebookButtonText}>Continue with Facebook</Text>
          </TouchableOpacity>
        </View>

        <View style={globalStyles.dividerContainer}>
          <View style={globalStyles.divider} />
          <Text style={globalStyles.dividerText}>or</Text>
          <View style={globalStyles.divider} />
        </View>

        {!isSignIn && (
          <View style={globalStyles.inputContainer}>
            <Icon name="user" size={16} color="#666" style={globalStyles.inputIcon} />
            <TextInput
              placeholder="Full Name"
              style={globalStyles.inputWithIcon}
              value={formData.fullName}
              onChangeText={(text) => handleInputChange('fullName', text)}
              editable={!loading}
            />
          </View>
        )}

        <View style={globalStyles.inputContainer}>
          <Icon name="envelope" size={16} color="#666" style={globalStyles.inputIcon} />
          <TextInput
            placeholder="Email"
            style={globalStyles.inputWithIcon}
            value={formData.email}
            onChangeText={(text) => handleInputChange('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
        </View>

        <View style={globalStyles.inputContainer}>
          <Icon name="lock" size={16} color="#666" style={globalStyles.inputIcon} />
          <TextInput
            placeholder="Password"
            style={globalStyles.inputWithIcon}
            value={formData.password}
            onChangeText={(text) => handleInputChange('password', text)}
            secureTextEntry
            editable={!loading}
          />
        </View>

        {!isSignIn && (
          <View style={globalStyles.inputContainer}>
            <Icon name="lock" size={16} color="#666" style={globalStyles.inputIcon} />
            <TextInput
              placeholder="Confirm Password"
              style={globalStyles.inputWithIcon}
              value={formData.confirmPassword}
              onChangeText={(text) => handleInputChange('confirmPassword', text)}
              secureTextEntry
              editable={!loading}
            />
          </View>
        )}

        <TouchableOpacity 
          style={[
            globalStyles.primaryButton, 
            loading && globalStyles.disabledButton
          ]} 
          onPress={handleSubmit} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={globalStyles.primaryButtonText}>
              {isSignIn ? 'Sign in' : 'Create Account'}
            </Text>
          )}
        </TouchableOpacity>

        <View style={globalStyles.toggleContainer}>
          <Text style={globalStyles.toggleText}>
            {isSignIn ? "Don't have an account? " : 'Already have an account? '}
            <Text 
              style={[
                globalStyles.toggleLink,
                loading && globalStyles.disabledLink
              ]} 
              onPress={!loading ? () => setIsSignIn(!isSignIn) : undefined}
            >
              {isSignIn ? 'Sign up' : 'Sign in'}
            </Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignInScreen;