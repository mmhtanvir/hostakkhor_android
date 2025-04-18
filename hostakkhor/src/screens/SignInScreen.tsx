import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image, ScrollView
} from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SvgUri } from 'react-native-svg';

const SignInScreen = () => {
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

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
  };

  return (
    <ScrollView contentContainerStyle={globalStyles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={globalStyles.authContainer}>

        {/* Logo */}
        <View style={globalStyles.logoContainer}>
        <SvgUri
          width="80"
          height="80"
          uri="https://files.hostakkhor.com/download/711dffc3-3e8f-4b55-ad6b-f43a2eed6c2e-hotakkhor-logo.svg"
        />
          <Text style={globalStyles.appName}>Hostakkhor</Text>
        </View>

        {/* Title */}
        <Text style={globalStyles.authTitle}>
          {isSignIn ? 'Sign in to your account' : 'Create Account'}
        </Text>

        {/* Social Login Buttons */}
        <View style={globalStyles.socialContainer}>
        <TouchableOpacity 
            style={[globalStyles.socialButton, globalStyles.googleButton]}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }}
              style={globalStyles.socialIcon}
            />
            <Text style={globalStyles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

        <TouchableOpacity style={[globalStyles.socialButton, globalStyles.facebookButton]}>
          <Icon name="facebook" size={20} color="#fff" style={globalStyles.socialIconLeft} />
          <Text style={globalStyles.facebookButtonText}>Continue with Facebook</Text>
        </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={globalStyles.dividerContainer}>
          <View style={globalStyles.divider} />
          <Text style={globalStyles.dividerText}>or</Text>
          <View style={globalStyles.divider} />
        </View>

        {/* Input Fields */}
        {!isSignIn && (
          <View style={globalStyles.inputContainer}>
            <Icon name="user" size={16} color="#666" style={globalStyles.inputIcon} />
            <TextInput
              placeholder="Full Name"
              style={globalStyles.inputWithIcon}
              value={formData.fullName}
              onChangeText={(text) => handleInputChange('fullName', text)}
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
            />
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity style={globalStyles.primaryButton} onPress={handleSubmit}>
          <Text style={globalStyles.primaryButtonText}>
            {isSignIn ? 'Sign in' : 'Create Account'}
          </Text>
        </TouchableOpacity>

        {/* Toggle Sign In / Sign Up */}
        <View style={globalStyles.toggleContainer}>
          <Text style={globalStyles.toggleText}>
            {isSignIn ? "Don't have an account? " : 'Already have an account? '}
            <Text style={globalStyles.toggleLink} onPress={() => setIsSignIn(!isSignIn)}>
              {isSignIn ? 'Sign up' : 'Sign in'}
            </Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignInScreen;
