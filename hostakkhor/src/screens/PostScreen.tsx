import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation, useRoute } from '@react-navigation/native';
import { globalStyles } from '../styles/globalStyles';
import Header from '../components/Header';
import { fetchPostById } from '../api/api'; 
const PostDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { postId } = route.params as { postId: string }; // Post ID passed through navigation

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const getPostDetails = async () => {
      setLoading(true);
      try {
        const fetchedPost = await fetchPostById(postId);
        setPost(fetchedPost);
      } catch (error) {
        console.error('Error fetching post details:', error);
      } finally {
        setLoading(false);
      }
    };

    getPostDetails();
  }, [postId]);

  if (loading) {
    return (
      <View style={[globalStyles.container, styles.center]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={[globalStyles.container, styles.center]}>
        <Text style={styles.errorText}>Post not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={18} color="#000" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <Header />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityLabel="Back"
          accessibilityRole="button"
        >
          <Icon name="arrow-left" size={18} color="#000" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {/* Post Card */}
        <View style={styles.postCard}>
          {/* Top Row: Avatar, Name, Date, Share */}
          <View style={styles.postHeader}>
            <Image
              source={{ uri: post.author.avatar || 'https://placehold.co/100x100.png' }}
              style={styles.avatar}
            />
            <View style={styles.postInfo}>
              <Text style={styles.postName}>{post.author.name || 'Unknown Author'}</Text>
              <View style={styles.dateRow}>
                <Icon name="calendar" size={14} color="#888" style={styles.dateIcon} />
                <Text style={styles.postDate}>
                  {new Date(post.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.shareBtn}>
              <Icon name="share-alt" size={20} color="#555" />
            </TouchableOpacity>
          </View>

          {/* Post Image */}
          {post.images?.[0] ? (
            <Image
              source={{ uri: post.images[0] }}
              style={styles.postImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>No Image Available</Text>
            </View>
          )}

          {/* Post Content */}
          <Text style={styles.postContent}>{post.content || 'No content available.'}</Text>
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
    height: 300,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginTop: 8,
  },
  imagePlaceholder: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
    borderRadius: 8,
    marginTop: 8,
  },
  imagePlaceholderText: {
    color: '#888',
    fontSize: 16,
  },
  postContent: {
    marginTop: 16,
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  errorText: {
    fontSize: 16,
    color: '#888',
    marginBottom: 16,
  },
});