import React, { useState } from 'react';
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
} from 'react-native';
import Header from '../components/Header';
import { globalStyles } from '../styles/globalStyles';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

const CreatePost = () => {
  const [text, setText] = useState('');
  const [selectedOption, setSelectedOption] = useState('Personal Post');
  const [showDropdown, setShowDropdown] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [audioUri, setAudioUri] = useState(null);

  const postOptions = [
    'Personal Post',
    'Post to your page',
  ];

  const requestGalleryPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Gallery Permission',
            message: 'App needs access to your gallery',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs access to your camera',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handleAddImage = async () => {
    const galleryPermission = await requestGalleryPermission();
    const cameraPermission = await requestCameraPermission();

    if (!galleryPermission || !cameraPermission) {
      Alert.alert('Permission required', 'Please allow access to camera and gallery');
      return;
    }

    Alert.alert(
      'Select Image Source',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: () => {
            launchCamera(
              {
                mediaType: 'photo',
                quality: 1,
                saveToPhotos: true,
              },
              (response) => {
                if (response.didCancel) {
                  console.log('User cancelled camera');
                } else if (response.errorCode) {
                  Alert.alert('Camera Error', response.errorMessage);
                } else if (response.assets && response.assets.length > 0) {
                  const selectedImage = response.assets[0];
                  setImageUri(selectedImage.uri);
                }
              }
            );
          },
        },
        {
          text: 'Gallery',
          onPress: () => {
            launchImageLibrary(
              {
                mediaType: 'photo',
                quality: 1,
                selectionLimit: 1,
              },
              (response) => {
                if (response.didCancel) {
                  console.log('User cancelled image picker');
                } else if (response.errorCode) {
                  Alert.alert('Gallery Error', response.errorMessage);
                } else if (response.assets && response.assets.length > 0) {
                  const selectedImage = response.assets[0];
                  setImageUri(selectedImage.uri);
                }
              }
            );
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const removeImage = () => {
    setImageUri(null);
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setShowDropdown(false);
  };

  const handleAddAudio = () => {
    Alert.alert('Coming Soon', 'Audio upload feature will be added soon');
  };

  const handlePostSubmit = () => {
    if (!text.trim()) {
      Alert.alert('Required', 'Please enter some text for your post');
      return;
    }

    console.log('Post submitted:', {
      text,
      destination: selectedOption,
      imageUri,
      audioUri
    });

    Alert.alert('Success', 'Post created successfully!');
    setText('');
    setImageUri(null);
    setAudioUri(null);
  };

  return (
    <View style={globalStyles.container}>
      <Header showProfile={true} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Create a Post</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Post Destination (Optional)</Text>

          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowDropdown(true)}
          >
            <Text style={styles.dropdownText}>{selectedOption}</Text>
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/60/60995.png' }}
              style={styles.dropdownIcon}
            />
          </TouchableOpacity>

          <Modal
            visible={showDropdown}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowDropdown(false)}
          >
            <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
              <View style={styles.modalOverlay} />
            </TouchableWithoutFeedback>

            <View style={styles.dropdownOptions}>
              {postOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionItem,
                    selectedOption === option && styles.selectedOption
                  ]}
                  onPress={() => handleOptionSelect(option)}
                >
                  <Text style={styles.optionText}>{option}</Text>
                  {selectedOption === option && (
                    <Image
                      source={{ uri: 'https://cdn-icons-png.flaticon.com/512/845/845646.png' }}
                      style={styles.selectedIcon}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Modal>

          <TextInput
            style={styles.input}
            placeholder="Share your thoughts..."
            value={text}
            onChangeText={setText}
            multiline
            placeholderTextColor="#888"
          />

          {imageUri && (
            <View style={styles.previewContainer}>
              <Image
                source={{ uri: imageUri }}
                style={styles.previewImage}
              />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={removeImage}
              >
                <Image
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/685/685655.png' }}
                  style={styles.removeImageIcon}
                />
              </TouchableOpacity>
            </View>
          )}

          {audioUri && (
            <View style={styles.audioPreview}>
              <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/727/727269.png' }}
                style={styles.audioIcon}
              />
              <Text style={styles.audioText}>Audio attached</Text>
            </View>
          )}

          <View style={styles.mediaRow}>
            <TouchableOpacity
              style={styles.mediaButton}
              onPress={handleAddImage}
            >
              <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/149/149852.png' }}
                style={styles.mediaIcon}
              />
              <Text style={styles.mediaButtonText}>Add Image</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mediaButton}
              onPress={handleAddAudio}
            >
              <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/727/727269.png' }}
                style={styles.mediaIcon}
              />
              <Text style={styles.mediaButtonText}>Add Audio</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.postButton}
            onPress={handlePostSubmit}
          >
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subheading}>Your Recent Posts</Text>
        <Text style={styles.subtext}>View and manage your recent posts</Text>
        <Text style={styles.emptyText}>No posts found for this filter.</Text>
      </ScrollView>
    </View>
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
  label: {
    fontSize: 15,
    marginBottom: 10,
    color: '#555',
    fontWeight: '500',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#f5f5f5',
  },
  optionText: {
    fontSize: 15,
    color: '#333',
  },
  selectedIcon: {
    width: 16,
    height: 16,
    tintColor: '#1a73e8',
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
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 5,
  },
  removeImageIcon: {
    width: 20,
    height: 20,
    tintColor: '#fff',
  },
  audioPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  audioIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    tintColor: '#444',
  },
  audioText: {
    fontSize: 15,
    color: '#333',
  },
  mediaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
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
    marginLeft: 8,
    color: '#333',
  },
  mediaIcon: {
    width: 20,
    height: 20,
    tintColor: '#444',
  },
  postButton: {
    backgroundColor: '#1a73e8',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subheading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#000',
  },
  subtext: {
    fontSize: 14,
    color: '#555',
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
    padding: 20,
  },
});

export default CreatePost;