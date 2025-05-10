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

const API_URL = 'https://proxy.hostakkhor.com/proxy';
const FILE_UPLOAD_URL = 'https://files.hostakkhor.com/upload';
const audioRecorderPlayer = new AudioRecorderPlayer();
const { width } = Dimensions.get('window');

interface PostState {
  text: string;
  selectedOption: string;
  showDropdown: boolean;
  imageUri: string | null;
  audioUri: string | null;
  imagePreviewUrl: string | null;
}

const CreatePost = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState('00:00');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playTime, setPlayTime] = useState('00:00');

  const [state, setState] = useState<PostState>({
    text: '',
    selectedOption: 'public',
    showDropdown: false,
    imageUri: null,
    audioUri: null,
    imagePreviewUrl: null,
  });

  const postOptions = ['public', 'private'];

  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
      }
      if (isPlaying) {
        stopPlaying();
      }
    };
  }, []);

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

      console.log('Image picker response:', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        throw new Error(response.errorMessage);
      } else if (response.assets?.[0]) {
        const asset = response.assets[0];
        console.log('Selected image:', asset);

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

  const uploadFile = async (uri: string, type: 'image' | 'audio'): Promise<string> => {
    try {
      console.log('Starting file upload:', { type, uri });
    
      const formData = new FormData();
      const fileExtension = type === 'image' ? 'jpg' : 'm4a';
      const timestamp = Date.now();
      const fileName = `${timestamp}.${fileExtension}`;
    
      const fileData = {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        type: type === 'image' ? 'image/jpeg' : 'audio/m4a',
        name: fileName,
      };
    
      formData.append('file', fileData as any);
    
      console.log('Uploading file:', formData);
    
      const response = await fetch(FILE_UPLOAD_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });
    
      console.log('Upload response:', response);
    
      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }
    
      const result = await response.json();
      console.log('Upload result:', result);
    
      if (result.filename) {
        const fileUrl = `https://files.hostakkhor.com/files/${result.filename}`;
        console.log('Generated file URL:', fileUrl);
        return fileUrl;
      }
    
      throw new Error('No filename in upload response');
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      throw error;
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
      const audioPath = `${Date.now()}.m4a`;
      const result = await audioRecorderPlayer.startRecorder(
        audioPath,
        {
          AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
          AudioSourceAndroid: AudioSourceAndroidType.MIC,
          AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
          AVNumberOfChannelsKeyIOS: 2,
          AVFormatIDKeyIOS: AVEncodingOption.aac,
        }
      );

      audioRecorderPlayer.addRecordBackListener((e) => {
        setRecordingTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
      });

      setIsRecording(true);
      console.log('Recording started:', result);
    } catch (error) {
      console.error('Recording error:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!isRecording) return;

    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setIsRecording(false);
      setState(prev => ({ ...prev, audioUri: result }));
    } catch (error) {
      console.error('Stop recording error:', error);
    }
  };

  const startPlaying = async () => {
    if (!state.audioUri) return;

    try {
      await audioRecorderPlayer.startPlayer(state.audioUri);
      audioRecorderPlayer.addPlayBackListener((e) => {
        setPlayTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
        if (e.currentPosition === e.duration) {
          stopPlaying();
        }
      });
      setIsPlaying(true);
    } catch (error) {
      console.error('Playback error:', error);
      Alert.alert('Error', 'Failed to play recording. Please try again.');
    }
  };

  const stopPlaying = async () => {
    if (!isPlaying) return;

    try {
      await audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
      setIsPlaying(false);
      setPlayTime('00:00');
    } catch (error) {
      console.error('Stop playing error:', error);
    }
  };

  const removeAudio = () => {
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
      const postId = `${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const timestamp = Date.now();
      const key = `hostakkhor_posts_${postId}`;

      let uploadedImageUrl: string | undefined;
      let uploadedAudioUrl: string | undefined;

      // Handle image upload
      if (state.imageUri) {
        try {
          console.log('Starting image upload...');
          uploadedImageUrl = await uploadFile(state.imageUri, 'image');
          console.log('Image uploaded successfully:', uploadedImageUrl);
        } catch (error) {
          console.error('Image upload failed:', error);
          const continueWithoutImage = await new Promise((resolve) => {
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
          const continueWithoutAudio = await new Promise((resolve) => {
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
        authorId: user.id,
        author: {
          id: user.id,
          name: user.name || 'Anonymous',
          avatar: user.profileImageUrl || '',
          role: user.role || 'user',
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

      console.log('Creating post with data:', post);

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
        throw new Error('Failed to create post');
      }

      Alert.alert(
        'Success',
        'Post created successfully!',
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
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setState(prev => ({ ...prev, showDropdown: true }))}
          >
            <Text style={styles.dropdownText}>{state.selectedOption}</Text>
            <Icon name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>

          <Modal
            visible={state.showDropdown}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setState(prev => ({ ...prev, showDropdown: false }))}
          >
            <TouchableWithoutFeedback 
              onPress={() => setState(prev => ({ ...prev, showDropdown: false }))}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.dropdownOptions}>
                  {postOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.optionItem,
                        state.selectedOption === option && styles.selectedOption,
                      ]}
                      onPress={() => {
                        setState(prev => ({
                          ...prev,
                          selectedOption: option,
                          showDropdown: false,
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

          {state.imageUri && (
            <View style={styles.previewContainer}>
              <Image 
                source={{ uri: state.imagePreviewUrl || state.imageUri }}
                style={styles.previewImage}
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
                <Text style={styles.submitButtonText}>Post</Text>
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
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  dropdownText: {
    fontSize: 16,
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
    elevation: 5,
  },
  optionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedOption: {
    backgroundColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
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