<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
=======
import React, { useState, useEffect, useRef } from 'react';
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  SafeAreaView,
  Platform,
  Modal,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Linking,
  PermissionsAndroid,
<<<<<<< HEAD
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { useAuth } from '../contexts/AuthContext';
import AudioRecorder from '../components/AudioRecorder';
=======
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
} from 'react-native-audio-recorder-player';
import { useAuth } from '../contexts/AuthContext';
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
import { format } from 'date-fns';
import RNFS from 'react-native-fs';

const API_URL = 'https://proxy.hostakkhor.com/proxy';
const FILE_UPLOAD_URL = 'https://files.hostakkhor.com/upload';

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

<<<<<<< HEAD
interface RouteParams {
  pageId?: string;
  pageName?: string;
}

const CreatePost = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState('');
  const [loading, setLoading] = useState(false);
=======
const CreatePost = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState('00:00');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playTime, setPlayTime] = useState('00:00');
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer());
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013

  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [audioUri, setAudioUri] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [postType, setPostType] = useState('Personal Post');
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [userPages, setUserPages] = useState<Page[]>([]);
  const [showPagesDropdown, setShowPagesDropdown] = useState(false);
<<<<<<< HEAD
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);

  // Add a ref to the default image for consistency
  const DEFAULT_IMAGE = require('../assets/audio-placeholder.svg');
=======
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013

  useEffect(() => {
    updateCurrentDate();
    fetchUserPages();
<<<<<<< HEAD
  }, []);

  // If coming from PagesScreen, pre-select the page
  useEffect(() => {
    const params = route.params as RouteParams;
    if (params?.pageId && params?.pageName) {
      setPostType(params.pageName);
    }
  }, [route.params]);

=======
    return () => {
      cleanupRecording();
    };
  }, []);

>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
  const updateCurrentDate = () => {
    const date = new Date();
    const formattedDate = format(date, 'yyyy-MM-dd HH:mm:ss');
    setCurrentDate(formattedDate);
  };

<<<<<<< HEAD
  const fetchUserPages = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`${API_URL}/getsorted?keys=hostakkhor_pages_*&skip=0&limit=1000`);
      if (!response.ok) throw new Error('Failed to fetch pages');
=======
  const cleanupRecording = async () => {
    if (isRecording) {
      await stopRecording();
    }
    if (isPlaying) {
      await stopPlaying();
    }
  };

  const fetchUserPages = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`${API_URL}/getsorted?keys=hostakkhor_pages_*&skip=0&limit=1000`);
      
      if (!response.ok) throw new Error('Failed to fetch pages');
      
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
      const data = await response.json();
      if (data.result && Array.isArray(data.result)) {
        const pages = data.result
          .map((item: any) => item.value)
          .filter((page: any) => page.authorId === user.id)
          .sort((a: any, b: any) => b.created_at - a.created_at);
        setUserPages(pages);
      }
    } catch (error) {
      console.error('Error fetching user pages:', error);
    }
  };

<<<<<<< HEAD
  const generateTimestamp = () => new Date().getTime();
=======
  const generateTimestamp = () => {
    return new Date().getTime();
  };
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013

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
<<<<<<< HEAD
=======

>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
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
<<<<<<< HEAD
        // User cancelled image picker
=======
        console.log('User cancelled image picker');
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
      } else if (response.errorCode) {
        throw new Error(response.errorMessage || 'Unknown error occurred');
      } else if (response.assets?.[0]) {
        const asset = response.assets[0];
        setImageUri(asset.uri || '');
        setImagePreviewUrl(asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri || '');
      }
    } catch (error) {
<<<<<<< HEAD
=======
      console.error('Image selection error:', error);
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
    setShowImageOptions(false);
  };

<<<<<<< HEAD
  const removeAudio = () => {
    setAudioUri('');
=======
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
      setAudioUri(result);
      console.log('Recording stopped at:', result);
    } catch (error) {
      console.error('Stop recording error:', error);
      Alert.alert('Error', 'Failed to stop recording.');
    }
  };

  const startPlaying = async () => {
    if (!audioUri) return;

    try {
      console.log('Starting playback from:', audioUri);
      const result = await audioRecorderPlayer.current.startPlayer(audioUri);
      
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
    setAudioUri('');
    setRecordingTime('00:00');
    setPlayTime('00:00');
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
  };

  const removeImage = () => {
    setImageUri('');
    setImagePreviewUrl('');
  };

  const uploadFile = async (uri: string, type: 'image' | 'audio'): Promise<string> => {
    try {
<<<<<<< HEAD
=======
      console.log('Starting file upload:', { type, uri });
    
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
      const formData = new FormData();
      const fileExtension = type === 'image' ? 'jpg' : 'wav';
      const timestamp = generateTimestamp();
      const fileName = `${timestamp}.${fileExtension}`;
<<<<<<< HEAD
=======
    
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
      const fileData = {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        type: type === 'image' ? 'image/jpeg' : 'audio/wav',
        name: fileName,
      };
<<<<<<< HEAD
      formData.append('file', fileData as any);
=======
    
      formData.append('file', fileData as any);
      
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
      const response = await fetch(FILE_UPLOAD_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });
<<<<<<< HEAD
      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }
      const result = await response.json();
=======
    
      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }
    
      const result = await response.json();
      
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
      if (result.filename) {
        const fileUrl = `https://files.hostakkhor.com/files/${result.filename}`;
        return fileUrl;
      }
<<<<<<< HEAD
      throw new Error('No filename in upload response');
    } catch (error) {
=======
    
      throw new Error('No filename in upload response');
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
      throw error;
    }
  };

<<<<<<< HEAD
  // Function to get default image URI
  const getDefaultImageUri = () => {
    try {
      const resolvedSource = Image.resolveAssetSource(DEFAULT_IMAGE);
      return resolvedSource ? resolvedSource.uri : '';
    } catch (error) {
      return '';
    }
  };

=======
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
  const handlePostSubmit = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'Please login to create a post');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Required', 'Please enter some text for your post');
      return;
    }

    setLoading(true);

    try {
      const timestamp = generateTimestamp();
      const postId = generateUniqueId();
<<<<<<< HEAD
      const isPagePost = postType !== 'Personal Post';
      const selectedPage = userPages.find(page => page.name === postType);
      const key = `hostakkhor_posts_${postId}`;
=======
      
      // Determine if posting to profile or page
      const isPagePost = postType !== 'Personal Post';
      const selectedPage = userPages.find(page => page.name === postType);
      
      const key = isPagePost && selectedPage
        ? `hostakkhor_posts_${selectedPage.path || selectedPage.name.replace(/\s+/g, '_').toLowerCase()}_${postId}`
        : `hostakkhor_posts_${postId}`;
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013

      let uploadedImageUrl: string | undefined;
      let uploadedAudioUrl: string | undefined;

<<<<<<< HEAD
      // Handle default image for audio posts
      let imageToUpload = imageUri;

      // Important: Apply default image if audio exists but no image selected
      if (audioUri && !imageUri) {
        const defaultUri = getDefaultImageUri();
        if (defaultUri) {
          imageToUpload = defaultUri;
          setImagePreviewUrl(defaultUri);
        }
      }

      // Handle image upload
      if (imageToUpload) {
        try {
          uploadedImageUrl = await uploadFile(imageToUpload, 'image');
        } catch (error) {
=======
      // Handle image upload
      if (imageUri) {
        try {
          uploadedImageUrl = await uploadFile(imageUri, 'image');
        } catch (error) {
          console.error('Image upload failed:', error);
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
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
<<<<<<< HEAD
=======

>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
          if (!continueWithoutImage) {
            setLoading(false);
            return;
          }
        }
      }

      // Handle audio upload
      if (audioUri) {
        try {
          uploadedAudioUrl = await uploadFile(audioUri, 'audio');
        } catch (error) {
<<<<<<< HEAD
=======
          console.error('Audio upload failed:', error);
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
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
<<<<<<< HEAD
=======

>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
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
<<<<<<< HEAD
        authorId: user.id,
        author: {
          id: user.id,
          name: isPagePost && selectedPage ? selectedPage.name : user.name || 'Anonymous',
          avatar: isPagePost && selectedPage ? selectedPage.avatar : user.profileImageUrl || '',
        },
        content: content,
        images: uploadedImageUrl ? [uploadedImageUrl] : [],
        audioFiles: uploadedAudioUrl ? [uploadedAudioUrl] : [],
        videos: [],
        category: 'General',
=======
        authorId: isPagePost && selectedPage ? selectedPage.id : user.id,
        author: {
          id: isPagePost && selectedPage ? selectedPage.id : user.id,
          name: isPagePost && selectedPage ? selectedPage.name : user.name || 'Anonymous',
          avatar: isPagePost && selectedPage ? selectedPage.avatar : user.profileImageUrl || '',
          role: isPagePost ? 'page' : user.role || 'user',
        },
        content: content,
        images: uploadedImageUrl ? [uploadedImageUrl] : [], 
        audioFiles: uploadedAudioUrl ? [uploadedAudioUrl] : [],
        videos: [],
        category: 'General',
        likes: 0,
        comments: 0,
        likedBy: [],
        visibility: 'public',
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
        pinned: isPinned,
        isPagePost: isPagePost,
        pageId: isPagePost && selectedPage ? selectedPage.id : null
      };

<<<<<<< HEAD
=======
      console.log('Post data:', post);

>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
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

<<<<<<< HEAD
=======
      console.log('Post response:', response);

>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      Alert.alert(
        'Success',
        `Post created successfully on ${isPagePost && selectedPage ? selectedPage.name : 'your profile'}!`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
<<<<<<< HEAD
=======
      console.error('Error creating post:', error);
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
<<<<<<< HEAD
=======
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={20} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Post</Text>
        </View>
        <Text style={styles.dateText}>{currentDate}</Text>
      </View>

>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
          <View style={styles.formContainer}>
            {/* Post Type Selector */}
            <TouchableOpacity 
              style={styles.pageSelector}
              onPress={() => setShowPagesDropdown(true)}
            >
              <Text style={styles.pageSelectorLabel}>Post to:</Text>
              <View style={styles.pageSelectorContent}>
                <Text style={styles.pageSelectorText}>
                  {postType === 'Personal Post' ? 'My Profile' : postType}
                </Text>
                <Icon name="chevron-down" size={16} color="#666" />
              </View>
            </TouchableOpacity>

            {/* Content Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.contentInput}
                value={content}
                onChangeText={setContent}
                placeholder="What's on your mind?"
                multiline
                placeholderTextColor="#999"
                textAlignVertical="top"
              />
            </View>

            {/* Image Preview */}
            {imagePreviewUrl ? (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: imagePreviewUrl }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
                <TouchableOpacity 
                  style={styles.removeMediaButton} 
                  onPress={removeImage}
                >
                  <Icon name="times" size={18} color="#FFF" />
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Audio Preview */}
<<<<<<< HEAD
            {audioUri ? (
              <View style={styles.audioPreviewContainer}>
                <Icon name="volume-up" size={24} color="#666" />
                <Text style={styles.audioPreviewText}>Audio Recorded</Text>
                <TouchableOpacity style={styles.removeAudioButton} onPress={removeAudio}>
                  <Icon name="times" size={18} color="#666" />
                </TouchableOpacity>
              </View>
            ) : null}
=======
            {audioUri && (
              <View style={styles.audioContainer}>
                <TouchableOpacity onPress={isPlaying ? stopPlaying : startPlaying}>
                  <Icon name={isPlaying ? "pause" : "play"} size={24} color="#666" />
                </TouchableOpacity>
                <Text style={styles.audioText}>
                  {isPlaying ? playTime : recordingTime}
                </Text>
                <TouchableOpacity 
                  style={styles.removeAudioButton}
                  onPress={removeAudio}
                >
                  <Icon name="times" size={18} color="#666" />
                </TouchableOpacity>
              </View>
            )}
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013

            {/* Media Buttons */}
            <View style={styles.mediaButtons}>
              <TouchableOpacity 
                style={styles.mediaButton}
                onPress={() => setShowImageOptions(true)}
              >
                <Icon name="image" size={20} color="#666" />
                <Text style={styles.mediaButtonText}>Add Image</Text>
              </TouchableOpacity>

              <TouchableOpacity 
<<<<<<< HEAD
                style={styles.mediaButton}
                onPress={() => setShowAudioRecorder(true)}
              >
                <Icon name="microphone" size={20} color="#666" />
                <Text style={styles.mediaButtonText}>
                  {audioUri ? "Replace Audio" : "Record Audio"}
=======
                style={[styles.mediaButton, isRecording && styles.recordingButton]}
                onPress={isRecording ? stopRecording : startRecording}
              >
                <Icon 
                  name={isRecording ? "stop" : "microphone"} 
                  size={20} 
                  color={isRecording ? "#fff" : "#666"} 
                />
                <Text style={[
                  styles.mediaButtonText,
                  isRecording && styles.recordingText
                ]}>
                  {isRecording ? recordingTime : "Record Audio"}
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
                </Text>
              </TouchableOpacity>
            </View>

            {/* Pin Option */}
            <TouchableOpacity 
              style={styles.pinOption}
              onPress={() => setIsPinned(!isPinned)}
            >
              <View style={[styles.checkbox, isPinned && styles.checkboxChecked]}>
                {isPinned && <Icon name="check" size={14} color="#FFF" />}
              </View>
              <Text style={styles.pinText}>Pin to Profile</Text>
            </TouchableOpacity>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.updateButton, loading && styles.updateButtonDisabled]}
                onPress={handlePostSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.updateButtonText}>Create Post</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

<<<<<<< HEAD
      {/* Audio Recorder Modal */}
      <Modal
        visible={showAudioRecorder}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAudioRecorder(false)}
      >
        <View style={styles.audioRecorderModalOverlay}>
          <View style={styles.audioRecorderModalContainer}>
            <AudioRecorder
              onRecordingComplete={uri => {
                setAudioUri(uri);
                setShowAudioRecorder(false);
              }}
              onCancel={() => setShowAudioRecorder(false)}
            />
          </View>
        </View>
      </Modal>

=======
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
      {/* Image Options Modal */}
      <Modal
        visible={showImageOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowImageOptions(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Image</Text>
              <TouchableOpacity 
                style={styles.modalOption}
                onPress={() => handleImageSelection('camera')}
              >
                <Icon name="camera" size={22} color="#b06e31" />
                <Text style={styles.modalOptionText}>Take Photo</Text>
              </TouchableOpacity>
<<<<<<< HEAD
=======
              
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
              <TouchableOpacity 
                style={styles.modalOption}
                onPress={() => handleImageSelection('gallery')}
              >
                <Icon name="image" size={22} color="#b06e31" />
                <Text style={styles.modalOptionText}>Choose from Gallery</Text>
              </TouchableOpacity>
<<<<<<< HEAD
=======
              
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setShowImageOptions(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Pages Dropdown Modal */}
      <Modal
        visible={showPagesDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPagesDropdown(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowPagesDropdown(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.pagesDropdown}>
              <Text style={styles.modalTitle}>Select Destination</Text>
              <ScrollView style={styles.pageOptionsScrollView}>
                <TouchableOpacity
                  style={styles.pageOption}
                  onPress={() => {
                    setPostType('Personal Post');
                    setShowPagesDropdown(false);
                  }}
                >
                  <Text style={styles.pageOptionText}>My Profile</Text>
                  {postType === 'Personal Post' && (
                    <Icon name="check" size={16} color="#b06e31" />
                  )}
                </TouchableOpacity>
<<<<<<< HEAD
=======
                
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
                {userPages.map((page) => (
                  <TouchableOpacity
                    key={page.id}
                    style={styles.pageOption}
                    onPress={() => {
                      setPostType(page.name);
                      setShowPagesDropdown(false);
                    }}
                  >
                    <Text style={styles.pageOptionText}>{page.name}</Text>
                    {postType === page.name && (
                      <Icon name="check" size={16} color="#b06e31" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setShowPagesDropdown(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
<<<<<<< HEAD
  // ... rest of your styles ...
=======
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
<<<<<<< HEAD
=======
  header: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
  formContainer: {
    padding: 16,
  },
  pageSelector: {
    marginBottom: 16,
  },
  pageSelectorLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  pageSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  pageSelectorText: {
    fontSize: 16,
    color: '#333',
  },
  inputContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DEE2E6',
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  contentInput: {
    height: 150,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#212529',
    textAlignVertical: 'top',
  },
  imageContainer: {
    marginBottom: 16,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  imagePreview: {
    width: '100%',
    height: 200,
  },
  removeMediaButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
<<<<<<< HEAD
  audioPreviewContainer: {
=======
  audioContainer: {
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
<<<<<<< HEAD
  audioPreviewText: {
=======
  audioText: {
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
    marginLeft: 12,
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  removeAudioButton: {
    padding: 8,
  },
  mediaButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DEE2E6',
    flex: 0.48,
    justifyContent: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
<<<<<<< HEAD
=======
  recordingButton: {
    backgroundColor: '#ff4444',
  },
  recordingText: {
    color: '#fff',
  },
  mediaButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
  pinOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ADB5BD',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#b06e31',
    borderColor: '#b06e31',
  },
  pinText: {
    fontSize: 16,
    color: '#495057',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DEE2E6',
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#495057',
    fontWeight: '500',
  },
  updateButton: {
    flex: 1,
    backgroundColor: '#b06e31',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  updateButtonDisabled: {
    backgroundColor: '#d8a980',
  },
  updateButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalOptionText: {
    marginLeft: 16,
    fontSize: 16,
    color: '#333',
  },
  modalCancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  pagesDropdown: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxHeight: '70%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  pageOptionsScrollView: {
    maxHeight: 300,
  },
  pageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pageOptionText: {
    fontSize: 16,
    color: '#333',
  },
<<<<<<< HEAD
  audioRecorderModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioRecorderModalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 0,
    overflow: 'hidden',
  },
=======
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
});

export default CreatePost;