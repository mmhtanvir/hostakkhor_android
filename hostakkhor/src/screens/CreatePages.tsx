import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import Header from '../components/Header';
import { globalStyles } from '../styles/globalStyles';

const CreatePage = () => {
  const [pageName, setPageName] = useState('');
  const [bio, setBio] = useState('');

  return (
    <View style={globalStyles.container}>
      <Header showProfile={true} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Create a Page</Text>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Page Details</Text>

          <View style={styles.imagePickerContainer}>
            <TouchableOpacity style={styles.imageCircle}>
              <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1829/1829586.png' }}
                style={styles.imageIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cameraIconWrapper}>
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
            <TouchableOpacity style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createButton}>
              <Text style={styles.createText}>Create Page</Text>
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
  imageIcon: { width: 30, height: 30, tintColor: '#999' },
  cameraIconWrapper: {
    position: 'absolute',
    bottom: 0,
    right: 90,
    backgroundColor: '#9b5d18',
    borderRadius: 20,
    padding: 6,
  },
  cameraIcon: { width: 14, height: 14, tintColor: '#fff' },
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
  subtext: { fontSize: 13, color: '#555', marginBottom: 12 },
  emptyText: { fontSize: 13, color: '#999' },
});

export default CreatePage;