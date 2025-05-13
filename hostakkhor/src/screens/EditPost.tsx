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
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchPostById } from '../api/api';

const FILE_UPLOAD_URL = 'https://files.hostakkhor.com/upload';
const API_URL = 'https://proxy.hostakkhor.com/proxy';

const EditPostScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { postId } = route.params || { postId: null };

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [postType, setPostType] = useState('Personal Post');

  useEffect(() => {
    const getPostDetails = async () => {
      setLoading(true);
      try {
        if (postId) {
          const fetchedPost = await fetchPostById(postId);
          setTitle(fetchedPost.title || '');
          setContent(fetchedPost.content || '');
          setImageUri(fetchedPost.images?.[0] || '');
          setImagePreviewUrl(fetchedPost.images?.[0] || '');
          setIsPinned(fetchedPost.isPinned || false);
          setPostType(fetchedPost.postType || 'Personal Post');
        }
      } catch (error) {
        console.error('Error fetching post details:', error);
      } finally {
        setLoading(false);
      }
    };

    getPostDetails();
  }, [postId]);

  const uploadFile = async (uri: string): Promise<string> => {
    try {
      const formData = new FormData();
      const fileData = {
        uri,
        type: 'image/jpeg',
        name: `image_${Date.now()}.jpg`,
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
      return `https://files.hostakkhor.com/files/${result.filename}`;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleUpdatePost = async () => {
    setLoading(true);

    try {
      let uploadedImageUrl = imagePreviewUrl;

      // Upload new image if it exists
      if (imageUri && imageUri !== imagePreviewUrl) {
        uploadedImageUrl = await uploadFile(imageUri);
      }

      const updatedPost = {
        title,
        content,
        images: uploadedImageUrl ? [uploadedImageUrl] : [],
        isPinned,
        postType,
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

      Alert.alert('Success', 'Post updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating post:', error);
      Alert.alert('Error', 'Failed to update post');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUri('');
    setImagePreviewUrl('');
  };

  const handleAddImage = () => {
    // In a real app, this would open an image picker
    Alert.alert('Add Image', 'Image picker would open here');
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
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={20} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Post</Text>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Post Type Selector */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Post to Page (Optional)</Text>
            <TextInput
              style={styles.selector}
              value={postType}
              onChangeText={setPostType}
            />
          </View>

          {/* Post Content */}
          <View style={styles.formGroup}>
            <TextInput
              style={styles.contentInput}
              value={content}
              onChangeText={setContent}
              placeholder="What's on your mind?"
              multiline
              placeholderTextColor="#888"
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
              <TouchableOpacity style={styles.removeImageButton} onPress={handleRemoveImage}>
                <Icon name="times" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Media Actions */}
          <View style={styles.mediaActions}>
            <TouchableOpacity style={styles.mediaButton} onPress={handleAddImage}>
              <Icon name="image" size={22} color="#000" />
              <Text style={styles.mediaButtonText}>Add Image</Text>
            </TouchableOpacity>
          </View>

          {/* Pin Option */}
          <View style={styles.pinContainer}>
            <TouchableOpacity 
              style={styles.checkbox} 
              onPress={() => setIsPinned(!isPinned)}
            >
              {isPinned && <View style={styles.checkboxInner} />}
            </TouchableOpacity>
            <View style={styles.pinTextContainer}>
              <Text style={styles.pinText}>Pin this post to your profile</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.updateButton} onPress={handleUpdatePost}>
              <Text style={styles.updateButtonText}>Update Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  formContainer: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 30,
    backgroundColor: '#fff',
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  selector: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  contentInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  imageContainer: {
    marginBottom: 15,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  mediaButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  mediaButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  pinContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingVertical: 5,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: '#aaa',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 14,
    height: 14,
    backgroundColor: '#b06e31',
  },
  pinTextContainer: {
    flex: 1,
  },
  pinText: {
    fontSize: 15,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    backgroundColor: '#fff',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#333',
  },
  updateButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    backgroundColor: '#b06e31',
  },
  updateButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});

export default EditPostScreen;