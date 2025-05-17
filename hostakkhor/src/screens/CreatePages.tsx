import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Linking,
  PermissionsAndroid,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { globalStyles } from '../styles/globalStyles';

const FILE_UPLOAD_URL = 'https://files.hostakkhor.com/upload';

interface ImageFile {
  uri?: string;
  type?: string;
  fileName?: string;
}

const CreatePage = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const [pageName, setPageName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState('');
  const [imageFile, setImageFile] = useState<ImageFile | null>(null);
  const [pages, setPages] = useState<{ id: string; name: string }[]>([]);
  const [selectedPage, setSelectedPage] = useState<string | null>(null);

  const generateTimestamp = () => {
    const now = new Date();
    return now.getTime();
  };

  const generateUniqueId = () => {
    const timestamp = generateTimestamp();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `${timestamp}-${random}`;
  };

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        ];

        const results = await PermissionsAndroid.requestMultiple(permissions);
        return Object.values(results).every(
          result => result === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (error) {
        console.error('Permission request failed:', error);
        return false;
      }
    }
    return true;
  };

  const handleImagePick = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Please grant camera and media permissions',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() }
        ]
      );
      return;
    }

    const options = {
      mediaType: 'photo' as const,
      quality: 0.8,
      maxWidth: 1200,
      maxHeight: 1200,
      includeBase64: true,
    };

    try {
      const response = await launchImageLibrary(options);
      console.log('Image picker response:', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        throw new Error(response.errorMessage);
      } else if (response.assets?.[0]) {
        const asset = response.assets[0];
        setImageFile({
          uri: asset.uri,
          type: asset.type,
          fileName: asset.fileName,
        });
        setAvatar(asset.uri || '');
      }
    } catch (error) {
      console.error('Image selection error:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const uploadFile = async (uri: string): Promise<string> => {
    try {
      console.log('Starting file upload:', { uri });
    
      const formData = new FormData();
      const timestamp = generateTimestamp();
      const fileName = `${timestamp}.jpg`;
    
      const fileData = {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        type: 'image/jpeg',
        name: fileName,
      };
    
      formData.append('file', fileData as any);
    
      const response = await fetch(FILE_UPLOAD_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });
    
      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }
    
      const result = await response.json();
      if (result.filename) {
        return `https://files.hostakkhor.com/files/${result.filename}`;
      }
    
      throw new Error('No filename in upload response');
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const validateForm = () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a page');
      return false;
    }
    if (!pageName.trim()) {
      Alert.alert('Error', 'Page name is required');
      return false;
    }
    if (!bio.trim()) {
      Alert.alert('Error', 'Bio is required');
      return false;
    }
    return true;
  };

  const handleCancel = () => {
    setPageName('');
    setBio('');
    setAvatar('');
    setImageFile(null);
  };

  const createPage = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      let uploadedAvatarUrl = '';
      if (imageFile?.uri) {
        try {
          uploadedAvatarUrl = await uploadFile(imageFile.uri);
        } catch (error) {
          console.error('Image upload error:', error);
          Alert.alert('Error', 'Failed to upload image');
          return;
        }
      }

      const pageId = generateUniqueId();
      const currentTimestamp = generateTimestamp();
      
      const pageData = {
        key: `hostakkhor_pages_${pageId}`,
        value: {
          id: pageId,
          name: pageName.trim(),
          authorId: user.id,
          avatar: uploadedAvatarUrl || 'https://cdn-icons-png.flaticon.com/512/685/685655.png',
          bio: bio.trim(),
          created_at: currentTimestamp,
          updated_at: currentTimestamp,
          members: [user.id],
          path: `hostakkhor_pages_${pageId}`
        }
      };

      const response = await fetch('https://proxy.hostakkhor.com/proxy/putjson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pageData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create page: ${response.statusText}`);
      }

      setPageName('');
      setBio('');
      setAvatar('');
      setImageFile(null);
      Alert.alert('Success', 'Page created successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Pages', { pageId: pageId })
        }
      ]);
    } catch (error) {
      console.error('Create page error:', error);
      Alert.alert('Error', 'Failed to create page. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={globalStyles.container}>
      <Header showProfile={true} profileImageUrl={user?.profileImageUrl} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Page Details</Text>

          <View style={styles.imagePickerContainer}>
            <TouchableOpacity style={styles.imageCircle} onPress={handleImagePick}>
              {avatar ? (
                <Image
                  source={{ uri: avatar }}
                  style={styles.avatarImage}
                />
              ) : (
                <Image
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/685/685655.png' }}
                  style={styles.onlycameraIcon}
                />
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cameraIconWrapper}
              onPress={handleImagePick}
            >
              <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/685/685655.png' }}
                style={styles.cameraIcon}
              />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Enter page name"
            value={pageName}
            onChangeText={setPageName}
            placeholderTextColor="#888"
            editable={!loading}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell people about this page..."
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            placeholderTextColor="#888"
            editable={!loading}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={loading}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.createButton, loading && styles.disabledButton]}
              onPress={createPage}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.createText}>Create Page</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  imagePickerContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  imageCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#f1f1f1',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  onlycameraIcon: {
    width: 30,
    height: 30,
    tintColor: '#999',
  },
  cameraIconWrapper: {
    position: 'absolute',
    bottom: 0,
    right: 90,
    backgroundColor: '#9b5d18',
    borderRadius: 20,
    padding: 6,
    elevation: 3,
  },
  cameraIcon: {
    width: 14,
    height: 14,
    tintColor: '#fff',
  },
  input: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 15,
    color: '#000',
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#eee',
  },
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#9b5d18',
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.7,
    backgroundColor: '#ccc',
  },
  cancelText: {
    color: '#444',
  },
  createText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CreatePage;