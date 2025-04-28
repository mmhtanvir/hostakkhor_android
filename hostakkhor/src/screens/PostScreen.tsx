import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SvgUri } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { globalStyles } from '../styles/globalStyles';
import Header from '../components/Header';

const PostDetailsScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={globalStyles.container}>
      <Header />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={18} color="#000" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {/* Post Card */}
        <View style={styles.postCard}>
          {/* Top Row: Avatar, Name, Date, Share */}
          <View style={styles.postHeader}>
            <Image
              source={{ uri: 'https://placehold.co/100x100.png' }}
              style={styles.avatar}
            />
            <View style={styles.postInfo}>
              <Text style={styles.postName}>Joarder Yousuf Basir</Text>
              <View style={styles.dateRow}>
                <Icon name="calendar" size={14} color="#888" style={styles.dateIcon} />
                <Text style={styles.postDate}>07 Apr 2025</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.shareBtn}>
              <Icon name="share-alt" size={20} color="#555" />
            </TouchableOpacity>
          </View>

          {/* Post Image */}
          <Image
            source={{ uri: 'https://files.hostakkhor.com/download/bd9bc45b-b2a2-4652-9bc8-496c46a90539-post-joarder.jpg' }}
            style={styles.postImage}
            resizeMode="contain"
          />
        </View>
      </ScrollView>

    </View>
  );
};

export default PostDetailsScreen;

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  postCard: {
    backgroundColor: '#fffdf7',
    borderRadius: 12,
    padding: 16,
    borderColor: '#f4f0e6',
    borderWidth: 1,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
  },
  postInfo: {
    flex: 1,
  },
  postName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  dateIcon: {
    marginRight: 6,
  },
  postDate: {
    fontSize: 13,
    color: '#666',
  },
  shareBtn: {
    padding: 6,
  },
  postImage: {
    width: '100%',
    height: 500,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginTop: 8,
  },
});