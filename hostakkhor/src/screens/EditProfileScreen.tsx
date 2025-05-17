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
import Header from '../components/Header';
import { globalStyles } from '../styles/globalStyles';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = 'https://proxy.hostakkhor.com/proxy';
const FILE_UPLOAD_URL = 'https://files.hostakkhor.com/upload';
const DEFAULT_AVATAR = 'https://i.ibb.co/94s0s8k/IMG-20240417-040532-623.jpg';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { user, fetchUserProfile, fetchUserDetails } = useAuth();
  
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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
        // Don't show alert for initial load error
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const requestPermissions = async () => {
    if (Platform.OS !== 'android') return true;

    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        PermissionsAndroid.PERMISSIONS.CAMERA,
      ]);

      return (
        granted['android.permission.READ_MEDIA_IMAGES'] === PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const handleImageUpload = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please grant storage and camera permissions to upload images',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }

      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
      });

      if (result.didCancel || !result.assets || !result.assets[0]?.uri) {
        return;
      }

      setIsUploadingImage(true);
      const imageUri = result.assets[0].uri;

      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: result.assets[0].type || 'image/jpeg',
        name: 'profile-image.jpg',
      });

      const uploadResponse = await fetch(FILE_UPLOAD_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const uploadResult = await uploadResponse.json();
      if (!uploadResult.filename) {
        throw new Error('No filename in upload response');
      }

      const newImageUrl = `https://files.hostakkhor.com/files/${uploadResult.filename}`;
      setProfileImage(newImageUrl);
      
      Alert.alert('Success', 'Profile image updated');
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!user?.id || !user?.email) {
      Alert.alert('Error', 'You must be logged in to update your profile');
      return;
    }

    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter your name');
      return;
    }

    setIsSaving(true);
    try {
      const key = `hostakkhor_users_${user.id}`;
      const timestamp = new Date().getTime();

      const updateData = {
        ...user,
        name: name.trim(),
        bio: bio.trim() || "Hello World",
        profileImageUrl: profileImage,
        updated_at: timestamp,
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

      // Try to refresh user data but don't block on errors
      try {
        await Promise.all([
          fetchUserDetails(user.email),
        ]);
      } catch (refreshError) {
        console.warn('Error refreshing user data:', refreshError);
        // Continue with navigation even if refresh fails
      }

      Alert.alert(
        'Success', 
        'Profile updated successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              // Force navigation even if data refresh failed
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
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
                disabled={isUploadingImage}
              >
                {isUploadingImage ? (
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