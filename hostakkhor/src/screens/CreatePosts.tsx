import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
  TouchableWithoutFeedback,
  Alert,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary, launchCamera, Asset } from 'react-native-image-picker';
import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
} from 'react-native-audio-recorder-player';
import Header from '../components/Header';
import { globalStyles } from '../styles/globalStyles';
import { useAuth } from '../contexts/AuthContext';
import { IPost } from '../types/ipost';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Linking } from 'react-native';
import RNFS from 'react-native-fs';
import { Buffer } from 'buffer';

const API_URL = 'https://proxy.hostakkhor.com/proxy';
const FILE_UPLOAD_URL = 'https://files.hostakkhor.com/upload';
const audioRecorderPlayer = new AudioRecorderPlayer();
const { width } = Dimensions.get('window');

const CreatePost = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState('00:00');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playTime, setPlayTime] = useState('00:00');
  const [permissionStatus, setPermissionStatus] = useState<{[key: string]: boolean}>({});

  const [state, setState] = useState({
    text: '',
    selectedOption: 'public',
    showDropdown: false,
    imageUri: null as string | null,
    audioUri: null as string | null,
    imagePreviewUrl: null as string | null,
    uploadProgress: 0,
  });

  const postOptions = ['public', 'private'];

  useEffect(() => {
    checkPermissions();
    return () => {
      if (isRecording) {
        stopRecording();
      }
      if (isPlaying) {
        stopPlaying();
      }
    };
  }, []);

  const checkPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const permissions = {
          camera: PermissionsAndroid.PERMISSIONS.CAMERA,
          audio: PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          storage: PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          readStorage: PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        };

        const statuses = await PermissionsAndroid.requestMultiple([
          permissions.camera,
          permissions.audio,
          permissions.storage,
          permissions.readStorage,
        ]);

        setPermissionStatus(
          Object.keys(statuses).reduce((acc, key) => ({
            ...acc,
            [key]: statuses[key] === PermissionsAndroid.RESULTS.GRANTED,
          }), {})
        );
      } catch (error) {
        console.error('Permission check failed:', error);
      }
    }
  };

  const handleStateChange = (key: string, value: any) => {
    setState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const generateUniqueId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `${timestamp}-${random}`;
  };

  const uploadFile = async (uri: string, type: 'image' | 'audio'): Promise<string> => {
    try {
      const formData = new FormData();
      const fileExtension = type === 'image' ? 'jpg' : 'm4a';
      const mimeType = type === 'image' ? 'image/jpeg' : 'audio/m4a';
      const fileName = `${generateUniqueId()}.${fileExtension}`;

      formData.append('file', {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        type: mimeType,
        name: fileName,
      });

      const response = await fetch(FILE_UPLOAD_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to upload ${type}`);
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      throw error;
    }
  };

  const handlePostSubmit = async () => {
    if (!state.text.trim()) {
      Alert.alert('Required', 'Please enter some text for your post');
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    try {
      const postId = generateUniqueId();
      const timestamp = Date.now();
      const key = `hostakkhor_posts_${postId}`;

      let uploadedImageUrl: string | undefined;
      let uploadedAudioUrl: string | undefined;

      if (state.imageUri) {
        uploadedImageUrl = await uploadFile(state.imageUri, 'image');
      }

      if (state.audioUri) {
        uploadedAudioUrl = await uploadFile(state.audioUri, 'audio');
      }

      const post: IPost = {
        id: postId,
        path: key,
        created_at: timestamp,
        updated_at: timestamp,
        authorId: user?.id || generateUniqueId(),
        author: {
          id: user?.id,
          name: user?.name || 'Anonymous',
          avatar: user?.profileImageUrl || '',
          role: user?.role || 'user',
        },
        content: state.text,
        images: uploadedImageUrl ? [uploadedImageUrl] : [],
        audioFiles: uploadedAudioUrl ? [uploadedAudioUrl] : [],
        videos: [],
        category: 'General',
        likes: 0,
        comments: 0,
        likedBy: [],
        visibility: state.selectedOption as "public" | "private",
        pinned: false
      };

      const response = await fetch(`${API_URL}/putjson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key,
          value: post
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create post: ${errorText}`);
      }

      Alert.alert(
        'Success',
        'Post created successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert(
        'Error',
        'Failed to create post. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelection = async (source: 'camera' | 'gallery') => {
    const permission = source === 'camera'
      ? await requestPermission(PermissionsAndroid.PERMISSIONS.CAMERA)
      : await requestPermission(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);

    if (!permission) {
      Alert.alert(
        'Permission Required',
        'Please grant camera and storage permissions in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: openSettings }
        ]
      );
      return;
    }

    const options = {
      mediaType: 'photo' as const,
      quality: 1,
      saveToPhotos: source === 'camera',
      maxWidth: 1200,
      maxHeight: 1200,
      includeBase64: true,
    };

    try {
      const response = source === 'camera'
        ? await launchCamera(options)
        : await launchImageLibrary(options);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        throw new Error(response.errorMessage);
      } else if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        handleStateChange('imageUri', asset.uri);
        handleStateChange('imagePreviewUrl', `data:image/jpeg;base64,${asset.base64}`);
      }
    } catch (error) {
      console.error('Image selection error:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const requestPermission = async (permission: string) => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(permission);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const openSettings = () => {
    if (Platform.OS === 'android') {
      Linking.openSettings();
    }
  };

  const removeMedia = (type: string) => {
    handleStateChange(type, null);
    if (type === 'imageUri') {
      handleStateChange('imagePreviewUrl', null);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={globalStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header showProfile={true} />
      <ScrollView 
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create a Post</Text>

        <View style={styles.card}>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => handleStateChange('showDropdown', true)}
          >
            <Text style={styles.dropdownText}>{state.selectedOption}</Text>
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/60/60995.png' }}
              style={styles.dropdownIcon}
            />
          </TouchableOpacity>

          <Modal
            visible={state.showDropdown}
            transparent={true}
            animationType="fade"
            onRequestClose={() => handleStateChange('showDropdown', false)}
          >
            <TouchableWithoutFeedback 
              onPress={() => handleStateChange('showDropdown', false)}
            >
              <View style={styles.modalOverlay} />
            </TouchableWithoutFeedback>
            <View style={styles.dropdownOptions}>
              {postOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionItem,
                    state.selectedOption === option && styles.selectedOption,
                  ]}
                  onPress={() => {
                    handleStateChange('selectedOption', option);
                    handleStateChange('showDropdown', false);
                  }}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Modal>

          <TextInput
            style={styles.input}
            placeholder="Share your thoughts..."
            value={state.text}
            onChangeText={(text) => handleStateChange('text', text)}
            multiline
            placeholderTextColor="#888"
            maxLength={5000}
          />

          {state.imageUri && (
            <View style={styles.previewContainer}>
              <Image 
                source={{ 
                  uri: state.imagePreviewUrl || state.imageUri 
                }} 
                style={styles.previewImage}
              />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => removeMedia('imageUri')}
              >
                <Icon name="times-circle" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.mediaRow}>
            <TouchableOpacity
              style={styles.mediaButton}
              onPress={() => handleImageSelection('camera')}
            >
              <Icon name="camera" size={20} color="#333" />
              <Text style={styles.mediaButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.mediaButton}
              onPress={() => handleImageSelection('gallery')}
            >
              <Icon name="image" size={20} color="#333" />
              <Text style={styles.mediaButtonText}>Add from Gallery</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[
              styles.postButton,
              loading && styles.postButtonDisabled
            ]} 
            onPress={handlePostSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Icon name="paper-plane" size={16} color="#fff" />
                <Text style={styles.postButtonText}>Post</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    color: '#333',
    fontSize: 15,
  },
  dropdownIcon: {
    width: 16,
    height: 16,
    tintColor: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dropdownOptions: {
    position: 'absolute',
    top: '30%',
    left: '5%',
    right: '5%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    elevation: 5,
  },
  optionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedOption: {
    backgroundColor: '#f5f5f5',
  },
  optionText: {
    fontSize: 15,
    color: '#333',
  },
  input: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
    color: '#000',
    height: 140,
    textAlignVertical: 'top',
  },
  previewContainer: {
    marginBottom: 15,
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  mediaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '48%',
    justifyContent: 'center',
  },
  mediaButtonText: {
    color: '#333',
    fontSize: 14,
    marginLeft: 8,
  },
  postButton: {
    backgroundColor: '#1a73e8',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButtonDisabled: {
    backgroundColor: '#a0c3ff',
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default CreatePost;