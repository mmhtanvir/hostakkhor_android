import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation, useRoute } from '@react-navigation/native';
import { globalStyles } from '../styles/globalStyles';
import Header from '../components/Header';
import { fetchPostById } from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import Video from 'react-native-video';

interface PostAuthor {
  id: string;
  name: string;
  avatar?: string;
}

interface Post {
  id: string;
  content: string;
  created_at: string;
  author: PostAuthor;
  images?: string[];
  audio?: string;
}

const PostDetailsScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const route = useRoute();
  const { postId } = route.params as { postId: string };

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [playing, setPlaying] = useState(false); // Audio player state
  const [progress, setProgress] = useState(0); // Audio progress state

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

  const handleDeletePost = async () => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            const response = await fetch(
              `https://proxy.hostakkhor.com/proxy/remove?key=hostakkhor_posts_${postId}`,
              { method: 'GET' }
            );
            if (response.ok) {
              Alert.alert('Success', 'The post has been deleted.');
              navigation.goBack();
            } else {
              Alert.alert('Error', 'Failed to delete the post. Please try again.');
            }
          } catch (error) {
            console.error('Error deleting post:', error);
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handleAudioProgress = (data: any) => {
    if (data.seekableDuration > 0) {
      setProgress(data.currentTime / data.seekableDuration);
    }
  };

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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={18} color="#000" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.postCard}>
          {/* Header */}
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

          {/* Media Display */}
          {post.images?.length > 0 ? (
            <ScrollView horizontal style={styles.imageScroll} showsHorizontalScrollIndicator={false}>
              {post.images.map((imgUrl: string, index: number) => (
                <Image
                  key={index}
                  source={{ uri: imgUrl }}
                  style={styles.postImage}
                  resizeMode="contain"
                />
              ))}
            </ScrollView>
          ) : post.audio ? (
            <View style={styles.audioContainer}>
              <Text style={styles.audioLabel}>Audio Post</Text>
              <View style={styles.audioControls}>
                <TouchableOpacity 
                  style={styles.playButton}
                  onPress={handlePlayPause}
                >
                  <Icon name={playing ? 'pause' : 'play'} size={16} color="#fff" />
                </TouchableOpacity>
                <Video
                  source={{ uri: post.audio }}
                  audioOnly
                  controls={false}
                  paused={!playing}
                  style={styles.audioPlayer}
                  onProgress={handleAudioProgress}
                  onEnd={() => {
                    setPlaying(false);
                    setProgress(0);
                  }}
                />
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>No Media Available</Text>
            </View>
          )}

          {/* Content */}
          <Text style={styles.postContent}>{post.content || 'No content available.'}</Text>

          {/* Buttons for Author */}
          {user?.id === post.author.id && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate('PostEdit', { postId })}
              >
                <Icon name="edit" size={18} color="#fff" />
                <Text style={styles.editButtonText}>Edit Post</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePost}>
                <Icon name="trash" size={18} color="#fff" />
                <Text style={styles.deleteButtonText}>Delete Post</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

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
  imageScroll: {
    marginTop: 8,
  },
  postImage: {
    width: 300,
    height: 300,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#eee',
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
  audioContainer: {
    marginTop: 12,
    width: '100%',
  },
  audioLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#444',
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  playButton: {
    backgroundColor: '#5bc0de',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  audioPlayer: {
    width: 0,
    height: 0,
  },
  progressBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#5bc0de',
    borderRadius: 2,
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5bc0de',
    paddingVertical: 10,
    flex: 1,
    marginRight: 8,
    borderRadius: 8,
  },
  editButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d9534f',
    paddingVertical: 10,
    flex: 1,
    marginLeft: 8,
    borderRadius: 8,
  },
  deleteButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});

export default PostDetailsScreen;