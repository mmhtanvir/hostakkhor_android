import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import Header from '../components/Header';
import { globalStyles } from '../styles/globalStyles';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = 'https://proxy.hostakkhor.com/proxy';
const DEFAULT_AVATAR = 'https://i.ibb.co/94s0s8k/IMG-20240417-040532-623.jpg';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { user, token, fetchUserProfile, fetchUserDetails } = useAuth();
  
  // Form state
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState('');
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (user?.email) {
          const response = await fetchUserDetails(user.email);
          const userData = response.result[0]?.value;
          if (userData) {
            setName(userData.name || '');
            setEmail(userData.email || '');
            setBio(userData.bio || '');
            setProfileImage(userData.profileImageUrl || DEFAULT_AVATAR);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        Alert.alert('Error', 'Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  // Request permissions for image picker
  const requestPermissions = async () => {
    if (Platform.OS !== 'android') return true;

    try {
      const permissions = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.CAMERA,
      ]);

      return Object.values(permissions).every(
        (permission) => permission === PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  // Handle image upload
  const handleImageUpload = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please grant camera and storage permissions to upload images'
        );
        return;
      }

      const result = await launchImageLibrary({
        mediaType: 'photo',
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.8,
      });

      if (result.canceled || !result.assets || !result.assets[0]?.uri) {
        return;
      }

      setIsSaving(true);
      const imageUri = result.assets[0].uri;

      // Create form data for image upload
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: result.assets[0].type || 'image/jpeg',
        name: 'profile-image.jpg',
      });

      // Upload image to file server
      const uploadResponse = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const { filename } = await uploadResponse.json();
      const newImageUrl = `${API_BASE_URL}/files/${filename}`;

      // Update profile with new image URL
      if (!user?.email) {
        throw new Error('User email not found');
      }

      const key = `hostakkhor_users_${user.email.replace('@', '-').replace('.', '-')}`;
      const updateData = {
        ...user,
        profileImageUrl: newImageUrl,
      };

      // Update user profile
      const updateResponse = await fetch(`${API_BASE_URL}/putjson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: key,
          value: updateData
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update profile');
      }

      // Update local state and refresh user data
      setProfileImage(newImageUrl);
      await fetchUserDetails(user.email);
      
      Alert.alert('Success', 'Profile image updated successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    if (!user?.email) {
      Alert.alert('Error', 'You must be logged in to update your profile');
      return;
    }

    setIsSaving(true);
    try {
      const key = `hostakkhor_users_${user.email.replace('@', '-').replace('.', '-')}`;
      const updateData = {
        email: user.email,
        name: name,
        bio: bio || "My world",
        created_at: user.created_at,
        updated_at: new Date().toISOString(),
        id: key,
        path: key,
        onboardingCompleted: true,
        profileImageUrl: profileImage,
        pinnedPostTheme: user.pinnedPostTheme || "default"
      };

      // Update user profile
      const response = await fetch(`${API_BASE_URL}/putjson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: key,
          value: updateData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // Refresh user data
      await fetchUserDetails(user.email);
      
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[globalStyles.container, globalStyles.center]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <Header showProfile />

      <ScrollView contentContainerStyle={globalStyles.scrollContainer}>
        <View style={[globalStyles.card, { paddingVertical: 30 }]}>
          <Text style={globalStyles.title}>Edit Profile</Text>

          <View style={{ alignItems: 'center', marginVertical: 20 }}>
            <View style={{ position: 'relative' }}>
              <Image
                source={{ uri: profileImage || DEFAULT_AVATAR }}
                style={globalStyles.avatarLarge}
              />
              <TouchableOpacity 
                style={globalStyles.cameraIconContainer}
                onPress={handleImageUpload}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Image
                    source={{
                      uri: 'https://cdn-icons-png.flaticon.com/512/685/685655.png',
                    }}
                    style={globalStyles.cameraIcon}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <Text style={globalStyles.label}>Name</Text>
          <TextInput
            style={globalStyles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
          />

          <Text style={globalStyles.label}>Email</Text>
          <TextInput
            style={[globalStyles.input, { backgroundColor: '#f4f4f4' }]}
            value={email}
            editable={false}
          />
          <Text style={globalStyles.caption}>Email cannot be changed</Text>

          <Text style={globalStyles.label}>About (Bio)</Text>
          <TextInput
            style={globalStyles.textArea}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself"
            multiline
            numberOfLines={4}
          />

          <View style={{ flexDirection: 'row', marginTop: 30, justifyContent: 'space-between' }}>
            <TouchableOpacity
              style={[globalStyles.buttonOutlined, { flex: 1, marginRight: 10 }]}
              onPress={() => navigation.goBack()}
              disabled={isSaving}
            >
              <Text style={globalStyles.buttonTextOutlined}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[globalStyles.buttonPrimary, { flex: 1, marginLeft: 10 }]}
              onPress={handleSaveChanges}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={globalStyles.editbuttonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default EditProfileScreen;