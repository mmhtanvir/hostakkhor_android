import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation, useRoute } from '@react-navigation/native';
import { format } from 'date-fns';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import AudioRecorder from '../components/AudioRecorder';
import { useAuth } from '../contexts/AuthContext';

const FILE_UPLOAD_URL = 'https://files.hostakkhor.com/upload';
const API_URL = 'https://proxy.hostakkhor.com/proxy';

interface RouteParams {
  postId: string;
}

interface Post {
  id: string;
  title?: string;
  content: string;
  images?: string[];
  audioFiles?: string[];
  isPinned: boolean;
  postType: string;
  created_at: number;
  updated_at: number;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface Page {
  id: string;
  name: string;
  avatar: string;
  path: string;
  authorId: string;
}

const EditPostScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { postId } = route.params as RouteParams;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [audioUri, setAudioUri] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [postType, setPostType] = useState('Personal Post');
  const [currentDate, setCurrentDate] = useState('');
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [userPages, setUserPages] = useState<Page[]>([]);
  const [showPagesDropdown, setShowPagesDropdown] = useState(false);

  useEffect(() => {
    fetchPostDetails();
    fetchUserPages();
    updateCurrentDate();
  }, [postId]);

  const updateCurrentDate = () => {
    const date = new Date();
    const formattedDate = format(date, 'yyyy-MM-dd');
    setCurrentDate(formattedDate);
  };

  const fetchUserPages = async () => {
    try {
      const response = await fetch(`${API_URL}/getsorted?keys=hostakkhor_pages_*&skip=0&limit=1000`);
      if (!response.ok) throw new Error('Failed to fetch pages');
      
      const data = await response.json();
      if (data.result && Array.isArray(data.result)) {
        const pages = data.result
          .map((item: any) => item.value)
          .filter((page: any) => page.authorId === user?.id)
          .sort((a: any, b: any) => b.created_at - a.created_at);
        setUserPages(pages);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
    }
  };

  const fetchPostDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/get?key=hostakkhor_posts_${postId}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }
      const data: Post = await response.json();

      setContent(data.content || '');
      setImageUri(data.images?.[0] || '');
      setImagePreviewUrl(data.images?.[0] || '');
      setAudioUri(data.audioFiles?.[0] || '');
      setIsPinned(data.isPinned || false);
      setPostType(data.postType || 'Personal Post');

    } catch (error) {
      console.error('Error fetching post:', error);
      Alert.alert('Error', 'Failed to load post details');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelection = async (type: 'camera' | 'gallery') => {
    const options = {
      mediaType: 'photo' as const,
      quality: 0.8,
      maxWidth: 1200,
      maxHeight: 1200,
    };

    try {
      const response = type === 'camera' 
        ? await launchCamera(options)
        : await launchImageLibrary(options);

      if (response.assets?.[0]?.uri) {
        setImageUri(response.assets[0].uri);
        setImagePreviewUrl(response.assets[0].uri);
      }
    } catch (error) {
      console.error('Image selection error:', error);
      Alert.alert('Error', 'Failed to select image');
    }
    setShowImageOptions(false);
  };

  const handleAudioRecorded = (uri: string) => {
    setAudioUri(uri);
    setShowAudioRecorder(false);
  };

  const uploadFile = async (uri: string, type: 'image' | 'audio'): Promise<string> => {
    try {
      const formData = new FormData();
      const fileExtension = type === 'image' ? 'jpg' : 'm4a';
      const timestamp = Date.now().toString();
      const fileName = `${timestamp}.${fileExtension}`;

      const fileData = {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        type: type === 'image' ? 'image/jpeg' : 'audio/m4a',
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
      console.error(`Error uploading ${type}:`, error);
      throw error;
    }
  };

  const handleUpdatePost = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Content cannot be empty');
      return;
    }

    setSubmitting(true);
    try {
      let uploadedImageUrl = imageUri === imagePreviewUrl ? imageUri : '';
      let uploadedAudioUrl = audioUri;

      if (imageUri && imageUri !== imagePreviewUrl) {
        uploadedImageUrl = await uploadFile(imageUri, 'image');
      }

      if (audioUri && !audioUri.startsWith('http')) {
        uploadedAudioUrl = await uploadFile(audioUri, 'audio');
      }

      const updatedPost = {
        content: content.trim(),
        images: uploadedImageUrl ? [uploadedImageUrl] : [],
        audioFiles: uploadedAudioUrl ? [uploadedAudioUrl] : [],
        isPinned,
        postType,
        updated_at: Date.now(),
      };

      const response = await fetch(`${API_URL}/putjson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: `hostakkhor_posts_${postId}`,
          value: updatedPost,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update post');
      }

      Alert.alert('Success', 'Post updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error updating post:', error);
      Alert.alert('Error', 'Failed to update post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUri('');
    setImagePreviewUrl('');
  };

  const handleRemoveAudio = () => {
    setAudioUri('');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#b06e31" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

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
                  onPress={handleRemoveImage}
                >
                  <Icon name="times" size={18} color="#FFF" />
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Audio Preview */}
            {audioUri && (
              <View style={styles.audioContainer}>
                <Icon name="music" size={24} color="#666" />
                <Text style={styles.audioText}>Audio recording</Text>
                <TouchableOpacity 
                  style={styles.removeAudioButton}
                  onPress={handleRemoveAudio}
                >
                  <Icon name="times" size={18} color="#666" />
                </TouchableOpacity>
              </View>
            )}

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
                style={styles.mediaButton}
                onPress={() => setShowAudioRecorder(true)}
              >
                <Icon name="microphone" size={20} color="#666" />
                <Text style={styles.mediaButtonText}>Add Audio</Text>
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
                disabled={submitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.updateButton, submitting && styles.updateButtonDisabled]}
                onPress={handleUpdatePost}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.updateButtonText}>Update Post</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
              
              <TouchableOpacity 
                style={styles.modalOption}
                onPress={() => handleImageSelection('gallery')}
              >
                <Icon name="image" size={22} color="#b06e31" />
                <Text style={styles.modalOptionText}>Choose from Gallery</Text>
              </TouchableOpacity>
              
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

      {/* Audio Recorder Modal */}
      {showAudioRecorder && (
        <Modal
          visible={showAudioRecorder}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAudioRecorder(false)}
        >
          <View style={styles.modalOverlay}>
            <AudioRecorder
              onRecordingComplete={handleAudioRecorded}
              onCancel={() => setShowAudioRecorder(false)}
            />
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
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
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  audioText: {
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
  mediaButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
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
});

export default EditPostScreen;