import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { globalStyles } from '../styles/globalStyles';
import { IPage } from './PagesScreen'; // Import the IPage interface

const API_BASE_URL = 'https://proxy.hostakkhor.com/proxy';
const FILE_UPLOAD_URL = 'https://files.hostakkhor.com/upload';

interface RouteParams {
  pageId: string;
}

const EditPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { pageId } = route.params as RouteParams;
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [state, setState] = useState({
    name: '',
    bio: '',
    category: '',
    visibility: 'public' as 'public' | 'private',
    avatar: '',
    coverImage: '',
    newAvatar: null as any,
    newCoverImage: null as any,
  });

  useEffect(() => {
    fetchPageData();
  }, [pageId]);

  const fetchPageData = async () => {
    try {
      setLoading(true);
      const url = `${API_BASE_URL}/getsorted?keys=hostakkhor_pages_${pageId}`;
      console.log('Fetching page data from:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Raw page data:', data);
      
      if (data?.result?.[0]?.value) {
        const pageData = data.result[0].value as IPage;
        setState(prev => ({
          ...prev,
          name: pageData.name || '',
          bio: pageData.bio || '',
          category: pageData.category || '',
          visibility: pageData.visibility || 'public',
          avatar: pageData.avatar || '',
          coverImage: pageData.coverImage || '',
        }));
      } else {
        throw new Error('No page data found');
      }
    } catch (error) {
      console.error('Failed to fetch page data:', error);
      Alert.alert('Error', 'Failed to load page data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImagePicker = async (type: 'avatar' | 'cover') => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1200,
        maxHeight: 1200,
      });

      if (result.assets && result.assets[0]) {
        const selectedImage = result.assets[0];
        
        setState(prev => ({
          ...prev,
          ...(type === 'avatar' 
            ? { 
                avatar: selectedImage.uri || '',
                newAvatar: selectedImage,
              }
            : {
                coverImage: selectedImage.uri || '',
                newCoverImage: selectedImage,
              }
          )
        }));
      }
    } catch (error) {
      console.error('Image selection error:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const uploadImage = async (imageFile: any): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? imageFile.uri : imageFile.uri.replace('file://', ''),
        type: imageFile.type || 'image/jpeg',
        name: `page_image_${Date.now()}.jpg`,
      } as any);

      const response = await fetch(FILE_UPLOAD_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      return `https://files.hostakkhor.com/files/${result.filename}`;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to update the page');
      return;
    }

    if (!state.name.trim()) {
      Alert.alert('Required', 'Please enter a page name');
      return;
    }

    setSaving(true);
    Keyboard.dismiss();

    try {
      let avatarUrl = state.avatar;
      let coverImageUrl = state.coverImage;

      if (state.newAvatar) {
        setUploadingImage(true);
        avatarUrl = await uploadImage(state.newAvatar);
      }

      if (state.newCoverImage) {
        setUploadingImage(true);
        coverImageUrl = await uploadImage(state.newCoverImage);
      }

      const key = `hostakkhor_pages_${pageId}`;
      const timestamp = Date.now();

      const updateData = {
        id: pageId,
        name: state.name.trim(),
        bio: state.bio.trim(),
        category: state.category.trim(),
        visibility: state.visibility,
        avatar: avatarUrl,
        coverImage: coverImageUrl,
        updated_at: timestamp,
        authorId: user.id,
      };

      const response = await fetch(`${API_BASE_URL}/putjson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key,
          value: updateData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update page');
      }

      Alert.alert(
        'Success',
        'Page updated successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error updating page:', error);
      Alert.alert('Error', 'Failed to update page. Please try again.');
    } finally {
      setSaving(false);
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <View style={[globalStyles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Edit Page Details</Text>
          
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image 
                source={state.avatar ? { uri: state.avatar } : require('../assets/default-profile.png')}
                style={styles.avatar}
              />
              <TouchableOpacity 
                style={styles.cameraButton}
                onPress={() => handleImagePicker('avatar')}
              >
                <Icon name="camera" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.label}>Page Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter page name"
              value={state.name}
              onChangeText={(name) => setState(prev => ({ ...prev, name }))}
            />
            
            <Text style={styles.label}>About (Bio)</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              placeholder="Enter bio"
              value={state.bio}
              onChangeText={(bio) => setState(prev => ({ ...prev, bio }))}
              multiline
              numberOfLines={4}
            />
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.updateButton}
                onPress={handleSubmit}
                disabled={saving || uploadingImage}
              >
                {saving || uploadingImage ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.updateButtonText}>Update Page</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContent: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  formSection: {
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  updateButton: {
    flex: 1,
    backgroundColor: '#B05A1D',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
cameraButton: {
  position: 'absolute',
  bottom: -5, // Changed from 0 to make it stick out
  right: -5, // Changed from 0 to make it stick out
  backgroundColor: '#B05A1D',
  width: 38, // Increased size
  height: 38, // Increased size
  borderRadius: 19, // Half of width/height
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 3, // Increased border width
  borderColor: '#fff',
  elevation: 4, // Added elevation for Android
  shadowColor: '#000', // Added shadow for iOS
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
},
avatarContainer: {
  position: 'relative',
  width: 100,
  height: 100,
  borderRadius: 50,
  backgroundColor: '#eee',
  overflow: 'visible', // Changed from 'hidden' to allow button to stick out
  marginBottom: 10, // Added margin to account for protruding button
  marginRight: 10, // Added margin to account for protruding button
},
});

export default EditPage;