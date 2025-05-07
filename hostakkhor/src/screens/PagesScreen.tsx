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
  FlatList,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { globalStyles } from '../styles/globalStyles';

// Mock function for API calls - Replace with actual API logic
const fetchRecentlyCreatedPages = async () => {
  // Simulate fetching pages
  return [
    { id: '1', name: 'Sample Page 1', bio: 'Description 1', avatar: '' },
    { id: '2', name: 'Sample Page 2', bio: 'Description 2', avatar: '' },
  ];
};

const createPageAPI = async (pageName, bio, avatarUri) => {
  // Replace with actual API logic
  console.log('Creating page:', { pageName, bio, avatarUri });
  return { success: true, id: 'new_page_id' };
};

const CreatePage = () => {
  const [pageName, setPageName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUri, setAvatarUri] = useState('');
  const [recentPages, setRecentPages] = useState([]);

  const fetchPages = async () => {
    const pages = await fetchRecentlyCreatedPages();
    setRecentPages(pages);
  };

  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 0.8,
    });

    if (result.assets && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const createPage = async () => {
    if (!pageName.trim()) {
      Alert.alert('Validation Error', 'Page name is required.');
      return;
    }

    const response = await createPageAPI(pageName, bio, avatarUri);
    if (response.success) {
      Alert.alert('Success', 'Page created successfully!');
      fetchPages(); // Refresh recently created pages
    } else {
      Alert.alert('Error', 'Failed to create the page. Please try again.');
    }
  };

  React.useEffect(() => {
    fetchPages();
  }, []);

  return (
    <View style={globalStyles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Create a Page</Text>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Page Details</Text>

          <View style={styles.imagePickerContainer}>
            <TouchableOpacity style={styles.imageCircle} onPress={pickImage}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <Image
                  source={{
                    uri: 'https://cdn-icons-png.flaticon.com/512/685/685655.png',
                  }}
                  style={styles.onlycameraIcon}
                />
              )}
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Enter page name"
            value={pageName}
            onChangeText={setPageName}
            placeholderTextColor="#888"
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell people about this page..."
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            placeholderTextColor="#888"
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => Alert.alert('Action', 'Cancelled')}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createButton} onPress={createPage}>
              <Text style={styles.createText}>Create Page</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.subheading}>Recently Created Pages</Text>
        {recentPages.length ? (
          <FlatList
            data={recentPages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.pageItem}>
                <Image
                  source={{ uri: item.avatar || 'https://via.placeholder.com/50' }}
                  style={styles.pageAvatar}
                />
                <View>
                  <Text style={styles.pageName}>{item.name}</Text>
                  <Text style={styles.pageBio}>{item.bio}</Text>
                </View>
              </View>
            )}
          />
        ) : (
          <Text style={styles.emptyText}>No pages found</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    elevation: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  imagePickerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imageCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#f1f1f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: { width: 90, height: 90, borderRadius: 45 },
  onlycameraIcon: { width: 30, height: 30, tintColor: '#999' },
  input: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 15,
    color: '#000',
  },
  textArea: { height: 100, textAlignVertical: 'top' },
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
  },
  cancelText: { color: '#444' },
  createText: { color: '#fff', fontWeight: 'bold' },
  subheading: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  emptyText: { fontSize: 13, color: '#999' },
  pageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    elevation: 1,
  },
  pageAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  pageName: { fontSize: 16, fontWeight: 'bold' },
  pageBio: { fontSize: 12, color: '#666' },
});

export default CreatePage;