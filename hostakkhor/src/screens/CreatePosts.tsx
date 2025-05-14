import React, { useState, useEffect, useRef } from 'react';
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
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
} from 'react-native-audio-recorder-player';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { globalStyles } from '../styles/globalStyles';
import RNFS from 'react-native-fs';

const API_URL = 'https://proxy.hostakkhor.com/proxy';
const FILE_UPLOAD_URL = 'https://files.hostakkhor.com/upload';
const { width } = Dimensions.get('window');

interface PostState {
  text: string;
  selectedVisibility: string;
  selectedPage: string | null;
  showVisibilityDropdown: boolean;
  showPagesDropdown: boolean;
  imageUri: string | null;
  audioUri: string | null;
  imagePreviewUrl: string | null;
  userPages: any[];
  pagesLoading: boolean;
}

interface Page {
  id: string;
  name: string;
  avatar: string;
  path: string;
  authorId: string;
  created_at: number;
}

interface User {
  id: string;
  name?: string;
  profileImageUrl?: string;
  role?: string;
}

const CreatePost = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState('00:00');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playTime, setPlayTime] = useState('00:00');
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer());

  const [state, setState] = useState<PostState>({
    text: '',
    selectedVisibility: 'public',
    selectedPage: null,
    showVisibilityDropdown: false,
    showPagesDropdown: false,
    imageUri: null,
    audioUri: null,
    imagePreviewUrl: null,
    userPages: [],
    pagesLoading: true,
  });

  const visibilityOptions = ['public', 'private'];
  const placeholderAudioImage = Platform.OS === 'android' ?
    { uri: '../assets/audio-placeholder.svg' } :
    require('../assets/audio-placeholder.svg');

  useEffect(() => {
    return () => {
      cleanupRecording();
    };
  }, []);

  const cleanupRecording = async () => {
    if (isRecording) {
      await stopRecording();
    }
    if (isPlaying) {
      await stopPlaying();
    }
  };

  useEffect(() => {
    const fetchUserPages = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch(`${API_URL}/getsorted?keys=hostakkhor_pages_*&skip=0&limit=1000`);
        
        if (!response.ok) throw new Error('Failed to fetch pages');
        
        const data = await response.json();
        if (data.result && Array.isArray(data.result)) {
          const pages = data.result
            .map((item: any) => item.value)
            .filter((page: any) => page.authorId === user.id)
            .sort((a: any, b: any) => b.created_at - a.created_at);
          setState(prev => ({
            ...prev,
            userPages: pages,
            pagesLoading: false
          }));
        }
      } catch (error) {
        console.error('Error fetching user pages:', error);
        setState(prev => ({
          ...prev,
          pagesLoading: false
        }));
      }
    };

    fetchUserPages();
  }, [user]);

  const generateTimestamp = () => {
    return new Date().getTime();
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
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO
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

  const handleImageSelection = async (source: 'camera' | 'gallery') => {
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
      const response = source === 'camera'
        ? await launchCamera(options)
        : await launchImageLibrary(options);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        throw new Error(response.errorMessage || 'Unknown error occurred');
      } else if (response.assets?.[0]) {
        const asset = response.assets[0];
        
        setState(prev => ({
          ...prev,
          imageUri: asset.uri || null,
          imagePreviewUrl: asset.base64
            ? `data:image/jpeg;base64,${asset.base64}`
            : asset.uri || null,
        }));
      }
    } catch (error) {
      console.error('Image selection error:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const startRecording = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Please grant audio recording permissions',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() }
        ]
      );
      return;
    }

    try {
      const timestamp = generateTimestamp();
      const path = Platform.OS === 'android' 
        ? `${RNFS.CachesDirectoryPath}/recording_${timestamp}.wav`
        : `recording_${timestamp}.wav`;

      const result = await audioRecorderPlayer.current.startRecorder(
        path,
        {
          AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
          AudioSourceAndroid: AudioSourceAndroidType.MIC,
          AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
          AVNumberOfChannelsKeyIOS: 2,
          AVFormatIDKeyIOS: AVEncodingOption.aac,
        }
      );

      audioRecorderPlayer.current.addRecordBackListener((e) => {
        setRecordingTime(audioRecorderPlayer.current.mmssss(Math.floor(e.currentPosition)));
      });

      setIsRecording(true);
      console.log('Recording started at:', result);
    } catch (error) {
      console.error('Recording error:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!isRecording) return;

    try {
      const result = await audioRecorderPlayer.current.stopRecorder();
      audioRecorderPlayer.current.removeRecordBackListener();
      setIsRecording(false);
      setState(prev => ({ ...prev, audioUri: result }));
      console.log('Recording stopped at:', result);
    } catch (error) {
      console.error('Stop recording error:', error);
      Alert.alert('Error', 'Failed to stop recording.');
    }
  };

  const startPlaying = async () => {
    if (!state.audioUri) return;

    try {
      console.log('Starting playback from:', state.audioUri);
      const result = await audioRecorderPlayer.current.startPlayer(state.audioUri);
      
      audioRecorderPlayer.current.addPlayBackListener((e) => {
        if (e.currentPosition === e.duration) {
          stopPlaying();
        } else {
          setPlayTime(audioRecorderPlayer.current.mmssss(Math.floor(e.currentPosition)));
        }
      });
      
      setIsPlaying(true);
      console.log('Playback started:', result);
    } catch (error) {
      console.error('Playback error:', error);
      Alert.alert('Error', 'Failed to play recording.');
    }
  };

  const stopPlaying = async () => {
    if (!isPlaying) return;

    try {
      await audioRecorderPlayer.current.stopPlayer();
      audioRecorderPlayer.current.removePlayBackListener();
      setIsPlaying(false);
      setPlayTime('00:00');
    } catch (error) {
      console.error('Stop playing error:', error);
    }
  };

  const removeAudio = () => {
    if (isPlaying) {
      stopPlaying();
    }
    setState(prev => ({ ...prev, audioUri: null }));
    setRecordingTime('00:00');
    setPlayTime('00:00');
  };

  const removeImage = () => {
    setState(prev => ({
      ...prev,
      imageUri: null,
      imagePreviewUrl: null,
    }));
  };

  const uploadFile = async (uri: string, type: 'image' | 'audio'): Promise<string> => {
    try {
      console.log('Starting file upload:', { type, uri });
    
      const formData = new FormData();
      const fileExtension = type === 'image' ? 'jpg' : 'wav';
      const timestamp = generateTimestamp();
      const fileName = `${timestamp}.${fileExtension}`;
    
      const fileData = {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        type: type === 'image' ? 'image/jpeg' : 'audio/wav',
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
        const fileUrl = `https://files.hostakkhor.com/files/${result.filename}`;
        return fileUrl;
      }
    
      throw new Error('No filename in upload response');
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      throw error;
    }
  };

  const handlePostSubmit = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'Please login to create a post');
      return;
    }

    if (!state.text.trim()) {
      Alert.alert('Required', 'Please enter some text for your post');
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    try {
      const timestamp = generateTimestamp();
      const postId = generateUniqueId();
      
      // Determine if posting to profile or page
      const isPagePost = state.selectedPage !== null;
      const selectedPage = state.userPages.find(page => page.id === state.selectedPage);
      
      const key = isPagePost && selectedPage
        ? `hostakkhor_posts_${selectedPage.path || selectedPage.name.replace(/\s+/g, '_').toLowerCase()}_${postId}`
        : `hostakkhor_posts_${postId}`;

      let uploadedImageUrl: string | undefined;
      let uploadedAudioUrl: string | undefined;

      // Handle image upload
      if (state.imageUri) {
        try {
          uploadedImageUrl = await uploadFile(state.imageUri, 'image');
        } catch (error) {
          console.error('Image upload failed:', error);
          const continueWithoutImage = await new Promise<boolean>((resolve) => {
            Alert.alert(
              'Upload Error',
              'Failed to upload image. Do you want to continue without the image?',
              [
                { 
                  text: 'Cancel', 
                  style: 'cancel',
                  onPress: () => resolve(false)
                },
                { 
                  text: 'Continue',
                  onPress: () => resolve(true)
                }
              ]
            );
          });

          if (!continueWithoutImage) {
            setLoading(false);
            return;
          }
        }
      }

      // Handle audio upload
      if (state.audioUri) {
        try {
          uploadedAudioUrl = await uploadFile(state.audioUri, 'audio');
        } catch (error) {
          console.error('Audio upload failed:', error);
          const continueWithoutAudio = await new Promise<boolean>((resolve) => {
            Alert.alert(
              'Upload Error',
              'Failed to upload audio. Do you want to continue without the audio?',
              [
                { 
                  text: 'Cancel', 
                  style: 'cancel',
                  onPress: () => resolve(false)
                },
                { 
                  text: 'Continue',
                  onPress: () => resolve(true)
                }
              ]
            );
          });

          if (!continueWithoutAudio) {
            setLoading(false);
            return;
          }
        }
      }

      const post = {
        id: postId,
        path: key,
        created_at: timestamp,
        updated_at: timestamp,
        authorId: isPagePost && selectedPage ? selectedPage.id : user.id,
        author: {
          id: isPagePost && selectedPage ? selectedPage.id : user.id,
          name: isPagePost && selectedPage ? selectedPage.name : user.name || 'Anonymous',
          avatar: isPagePost && selectedPage ? selectedPage.avatar : user.profileImageUrl || '',
          role: isPagePost ? 'page' : user.role || 'user',
        },
        content: state.text,
        images: uploadedImageUrl ? [uploadedImageUrl] : [placeholderAudioImage],
        audioFiles: uploadedAudioUrl ? [uploadedAudioUrl] : [],
        videos: [],
        category: 'General',
        likes: 0,
        comments: 0,
        likedBy: [],
        visibility: state.selectedVisibility as "public" | "private",
        pinned: false,
        isPagePost: isPagePost,
        pageId: isPagePost && selectedPage ? selectedPage.id : null
      };

      console.log('Post data:', post);

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

      console.log('Post response:', response);

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      Alert.alert(
        'Success',
        `Post created successfully on ${isPagePost && selectedPage ? selectedPage.name : 'your profile'}!`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
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
          {/* Post destination dropdown */}
          <View style={styles.dropdownRow}>
            <Text style={styles.dropdownLabel}>Post to:</Text>
            <TouchableOpacity
              style={[styles.dropdown, { flex: 1 }]}
              onPress={() => setState(prev => ({ ...prev, showPagesDropdown: true }))}
            >
              <Text style={styles.dropdownText}>
                {state.selectedPage 
                  ? state.userPages.find(p => p.id === state.selectedPage)?.name 
                  : 'My Profile'}
              </Text>
              <Icon name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Visibility dropdown */}
          <View style={styles.dropdownRow}>
            <Text style={styles.dropdownLabel}>Visibility:</Text>
            <TouchableOpacity
              style={[styles.dropdown, { flex: 1 }]}
              onPress={() => setState(prev => ({ ...prev, showVisibilityDropdown: true }))}
            >
              <Text style={styles.dropdownText}>{state.selectedVisibility}</Text>
              <Icon name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Pages dropdown modal */}
          <Modal
            visible={state.showPagesDropdown}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setState(prev => ({ ...prev, showPagesDropdown: false }))}
          >
            <TouchableWithoutFeedback 
              onPress={() => setState(prev => ({ ...prev, showPagesDropdown: false }))}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.dropdownOptions}>
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      state.selectedPage === null && styles.selectedOption,
                    ]}
                    onPress={() => {
                      setState(prev => ({
                        ...prev,
                        selectedPage: null,
                        showPagesDropdown: false,
                      }));
                    }}
                  >
                    <Text style={styles.optionText}>My Profile</Text>
                  </TouchableOpacity>
                  
                  {state.pagesLoading ? (
                    <ActivityIndicator size="small" color="#666" style={styles.loadingIndicator} />
                  ) : state.userPages.length > 0 ? (
                    state.userPages.map((page) => (
                      <TouchableOpacity
                        key={page.id}
                        style={[
                          styles.optionItem,
                          state.selectedPage === page.id && styles.selectedOption,
                        ]}
                        onPress={() => {
                          setState(prev => ({
                            ...prev,
                            selectedPage: page.id,
                            showPagesDropdown: false,
                          }));
                        }}
                      >
                        <Image 
                          source={{ uri: page.avatar || 'https://cdn-icons-png.flaticon.com/512/685/685655.png' }} 
                          style={styles.pageOptionImage}
                        />
                        <Text style={styles.optionText}>{page.name}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.noPagesOption}>
                      <Text style={styles.noPagesText}>You don't have any pages yet</Text>
                      <TouchableOpacity
                        style={styles.createPageButton}
                        onPress={() => {
                          setState(prev => ({ ...prev, showPagesDropdown: false }));
                          navigation.navigate('CreatePage' as never);
                        }}
                      >
                        <Text style={styles.createPageText}>Create Page</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          {/* Visibility dropdown modal */}
          <Modal
            visible={state.showVisibilityDropdown}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setState(prev => ({ ...prev, showVisibilityDropdown: false }))}
          >
            <TouchableWithoutFeedback 
              onPress={() => setState(prev => ({ ...prev, showVisibilityDropdown: false }))}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.dropdownOptions}>
                  {visibilityOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.optionItem,
                        state.selectedVisibility === option && styles.selectedOption,
                      ]}
                      onPress={() => {
                        setState(prev => ({
                          ...prev,
                          selectedVisibility: option,
                          showVisibilityDropdown: false,
                        }));
                      }}
                    >
                      <Text style={styles.optionText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          <TextInput
            style={styles.input}
            placeholder="Share your thoughts..."
            value={state.text}
            onChangeText={(text) => setState(prev => ({ ...prev, text }))}
            multiline
            placeholderTextColor="#888"
            maxLength={5000}
          />

          {state.imageUri && state.imagePreviewUrl && (
            <View style={styles.previewContainer}>
              <Image 
                source={{ uri: state.imagePreviewUrl }}
                style={styles.previewImage}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.removeMediaButton}
                onPress={removeImage}
              >
                <Icon name="times-circle" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          {state.audioUri && (
            <View style={styles.audioPreviewContainer}>
              <TouchableOpacity
                style={styles.playButton}
                onPress={isPlaying ? stopPlaying : startPlaying}
              >
                <Icon 
                  name={isPlaying ? "pause" : "play"} 
                  size={24} 
                  color="#1a73e8" 
                />
                <Text style={styles.playTime}>
                  {isPlaying ? playTime : recordingTime}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removeAudioButton}
                onPress={removeAudio}
              >
                <Icon name="times-circle" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.mediaButtonsContainer}>
            <TouchableOpacity
              style={styles.mediaButton}
              onPress={() => handleImageSelection('camera')}
            >
              <Icon name="camera" size={20} color="#333" />
              <Text style={styles.mediaButtonText}>Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mediaButton}
              onPress={() => handleImageSelection('gallery')}
            >
              <Icon name="image" size={20} color="#333" />
              <Text style={styles.mediaButtonText}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mediaButton, isRecording && styles.recordingButton]}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <Icon 
                name={isRecording ? "stop" : "microphone"} 
                size={20} 
                color={isRecording ? "#fff" : "#333"} 
              />
              <Text style={[
                styles.mediaButtonText,
                isRecording && styles.recordingText
              ]}>
                {isRecording ? recordingTime : "Record"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handlePostSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="paper-plane" size={16} color="#fff" />
                <Text style={styles.submitButtonText}>
                  {state.selectedPage 
                    ? `Post to ${state.userPages.find(p => p.id === state.selectedPage)?.name}`
                    : 'Post'}
                </Text>
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
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dropdownLabel: {
    marginRight: 10,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownOptions: {
    backgroundColor: '#fff',
    borderRadius: 8,
    width: '80%',
    maxHeight: '60%',
    elevation: 5,
  },
  optionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  pageOptionImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  loadingIndicator: {
    padding: 16,
  },
  noPagesOption: {
    padding: 16,
    alignItems: 'center',
  },
  noPagesText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  createPageButton: {
    backgroundColor: '#1a73e8',
    padding: 10,
    borderRadius: 5,
  },
  createPageText: {
    color: '#fff',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
    color: '#333',
  },
  previewContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeMediaButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    padding: 4,
  },
  audioPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playTime: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  removeAudioButton: {
    padding: 4,
  },
  mediaButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  mediaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  mediaButtonText: {
    marginLeft: 8,
    color: '#333',
    fontSize: 14,
  },
  recordingButton: {
    backgroundColor: '#ff4444',
  },
  recordingText: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#1a73e8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#a0c3ff',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default CreatePost;