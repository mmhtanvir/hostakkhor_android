import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import Header from '../components/Header';
import { globalStyles } from '../styles/globalStyles';

const CreatePost = () => {
  const [text, setText] = useState('');
  const [selectedOption, setSelectedOption] = useState('Personal Post');

  return (
    <View style={globalStyles.container}>
      <Header showProfile={true} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Create a Post</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Post to Page (Optional)</Text>

          <TouchableOpacity style={styles.dropdown}>
            <Text style={styles.dropdownText}>{selectedOption}</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Share your thoughts..."
            value={text}
            onChangeText={setText}
            multiline
            placeholderTextColor="#888"
          />

          <View style={styles.mediaRow}>
            <TouchableOpacity style={styles.mediaButton}>
              <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/149/149852.png' }}
                style={styles.mediaIcon}
              />
              <Text>Add Image</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mediaButton}>
              <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/727/727269.png' }}
                style={styles.mediaIcon}
              />
              <Text>Add Audio</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.subheading}>Your Recent Posts</Text>
        <Text style={styles.subtext}>View and manage your recent posts</Text>
        <Text style={styles.emptyText}>No posts found for this filter.</Text>
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
  label: { fontSize: 14, marginBottom: 8 },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  dropdownText: { color: '#333' },
  input: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 15,
    color: '#000',
    height: 100,
    textAlignVertical: 'top',
  },
  mediaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    width: '48%',
    justifyContent: 'center',
  },
  mediaIcon: {
    width: 20,
    height: 20,
    marginRight: 6,
    tintColor: '#444',
  },
  subheading: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  subtext: { fontSize: 13, color: '#555', marginBottom: 12 },
  emptyText: { fontSize: 13, color: '#999' },
});

export default CreatePost;
