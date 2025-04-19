import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SvgUri } from 'react-native-svg';
import { globalStyles } from '../styles/globalStyles';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';

const PageDetailsScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={globalStyles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={20} color="#000" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {/* Profile Card */}
        <View style={styles.card}>
          <Image
            source={{ uri: 'https://placehold.co/120x120.png' }}
            style={styles.avatar}
          />
          <Text style={styles.name}>Mahamudul Hasan</Text>
          <View style={styles.row}>
            <Icon name="calendar" size={16} style={styles.icon} />
            <Text style={styles.text}>Created 19 Apr 2025</Text>
          </View>
          <View style={styles.row}>
            <Icon name="copy" size={16} style={styles.icon} />
            <Text style={styles.text}>Copy Link</Text>
          </View>
          <View style={styles.row}>
            <Icon name="share-alt" size={16} style={styles.icon} />
            <Text style={styles.text}>Share Page</Text>
          </View>
          <View style={styles.row}>
            <Icon name="pencil" size={16} style={styles.icon} />
            <Text style={styles.text}>Edit Page</Text>
          </View>
          <TouchableOpacity style={styles.deleteRow}>
            <Icon name="trash" size={16} color="#e53935" style={styles.icon} />
            <Text style={styles.deleteText}>Delete Page</Text>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.sectionText}>No description available.</Text>
        </View>

        {/* Posts Section */}
        <View style={styles.section}>
          <View style={styles.postHeader}>
            <Text style={styles.sectionTitle}>Posts</Text>
            <TouchableOpacity style={styles.createPostBtn}>
              <Text style={styles.createPostText}>Create Post</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Search posts..."
            placeholderTextColor="#999"
          />

          <TouchableOpacity style={styles.allBtn}>
            <Text style={styles.allBtnText}>All</Text>
          </TouchableOpacity>

          <Text style={styles.noPostsText}>No posts found for this filter.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default PageDetailsScreen;

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backText: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fffdf7',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    elevation: 1,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f4f0e6',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignSelf: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  icon: {
    marginRight: 10,
    color: '#444',
    width: 20,
  },
  text: {
    fontSize: 15,
    color: '#333',
  },
  deleteText: {
    fontSize: 15,
    color: '#e53935',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fffdf7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f4f0e6',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: '#666',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  createPostBtn: {
    backgroundColor: '#9c530a',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  createPostText: {
    color: '#fffdf7',
    fontSize: 14,
    fontWeight: '600',
  },
  searchInput: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    fontSize: 14,
    marginTop: 12,
  },
  allBtn: {
    backgroundColor: '#9c530a',
    paddingVertical: 6,
    paddingHorizontal: 20,
    alignSelf: 'center',
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 16,
  },
  allBtnText: {
    color: '#fffdf7',
    fontSize: 14,
    fontWeight: '600',
  },
  noPostsText: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    marginTop: 12,
  },
});
