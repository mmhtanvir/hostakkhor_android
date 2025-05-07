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
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Header from '../components/Header';
import { globalStyles } from '../styles/globalStyles';

const CreatePage = () => {
  const [pageName, setPageName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState('');

  const generateUniqueId = () => {
    // Generate a timestamp-based ID
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `${timestamp}${random}`;
  };

  const handleImagePick = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (result.assets && result.assets[0]) {
        // Here you would typically first upload the image to your server
        // and get back a URL. For now, we'll just store the local URI
        setAvatar(result.assets[0].uri || '');
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const validateForm = () => {
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

  const createPage = async () => {
    if (!validateForm()) return;
  
    try {
      setLoading(true);
      const pageId = generateUniqueId();
      const userId = 'mmhtanvir';
      const currentTimestamp = new Date().getTime();
      
      const pageData = {
        key: `hostakkhor_pages_${pageId}`,
        value: {
          id: pageId,
          name: pageName.trim(),
          authorId: `${userId}-${pageId}-xQ2t8a-8hn1mT`,
          avatar: avatar,
          bio: bio.trim(),
          created_at: currentTimestamp,
          updated_at: currentTimestamp,
          members: [`${userId}-${pageId}-xQ2t8a-8hn1mT`],
          path: `hostakkhor_pages_${pageId}`
        }
      };
  
      // Log the request headers and body
      const headers = {
        'Content-Type': 'application/json',
      };
      
      console.log('Request Headers:', headers);
      console.log('Request Body:', JSON.stringify(pageData, null, 2));
  
      const response = await fetch('https://proxy.hostakkhor.com/proxy/putjson', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(pageData)
      });
  
      // Log the response headers
      const responseHeaders = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      console.log('Response Headers:', responseHeaders);
  
      if (!response.ok) {
        throw new Error('Failed to create page');
      }
  
      // Reset form and show success message
      setPageName('');
      setBio('');
      setAvatar('');
      Alert.alert('Success', 'Page created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create page. Please try again.');
      console.error('Create page error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setPageName('');
    setBio('');
    setAvatar('');
  };

  return (
    <View style={globalStyles.container}>
      <Header showProfile={true} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Create a Page</Text>
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

        <Text style={styles.subheading}>Recently Created Pages</Text>
        <Text style={styles.subtext}>View and manage your recently created pages</Text>
        <Text style={styles.emptyText}>No pages found</Text>
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
  subheading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtext: {
    fontSize: 13,
    color: '#555',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 13,
    color: '#999',
  },
});

export default CreatePage;