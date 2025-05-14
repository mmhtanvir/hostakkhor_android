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
  Dimensions,
  Platform,
  Share,
} from 'react-native';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import AudioPlayer from '../components/AudioPlayer';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';

interface PostAuthor {
  id: string;
  name: string;
  avatar?: string;
  role: string;
}

interface Post {
  id: string;
  path: string;
  content: string;
  created_at: number;
  updated_at: number;
  authorId: string;
  author: PostAuthor;
  images?: string[];
  audioFiles?: string[];
  videos?: string[];
  category: string;
  likes: number;
  comments: number;
  likedBy: string[];
  visibility: string;
  pinned: boolean;
  isPagePost: boolean;
  pageId: string | null;
}

interface RouteParams {
  postId: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_WIDTH = Math.min(300, SCREEN_WIDTH - 32);

const PostDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { postId } = route.params as RouteParams;
  const { user } = useAuth();
  const isFocused = useIsFocused();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [currentAudioPlaying, setCurrentAudioPlaying] = useState<string | null>(null);

  useEffect(() => {
    fetchPostDetails();

    // Cleanup on component unmount
    return () => {
      if (currentAudioPlaying) {
        setCurrentAudioPlaying(null);
      }
    };
  }, [postId]);

  // Handle screen focus changes
  useEffect(() => {
    if (!isFocused && currentAudioPlaying) {
      setCurrentAudioPlaying(null);
    }
  }, [isFocused]);

  const fetchPostDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://proxy.hostakkhor.com/proxy/get?key=hostakkhor_posts_${postId}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }
      const data = await response.json();
      console.log('Post data:', data);

      // Log audio files for debugging
      if (data.audioFiles) {
        console.log('Audio files:', data.audioFiles);
      }

      setPost(data);
    } catch (error) {
      console.error('Error fetching post:', error);
      Alert.alert(
        'Error',
        'Failed to load post. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const response = await fetch(
                `https://proxy.hostakkhor.com/proxy/remove?key=hostakkhor_posts_${postId}`,
                { method: 'GET' }
              );
              if (!response.ok) {
                throw new Error('Failed to delete post');
              }
              Alert.alert(
                'Success',
                'Post deleted successfully',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]
              );
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert(
                'Error',
                'Failed to delete post. Please try again.'
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    if (!post) return;

    setIsSharing(true);
    try {
      await Share.share({
        message: `${post.content}\n\nShared from Hostakkhor`,
        title: 'Share Post',
      });
    } catch (error) {
      console.error('Error sharing post:', error);
    } finally {
      setIsSharing(false);
    }
  };

const formatDate = (timestamp: number): string => {
  try {
    const date = new Date(timestamp);
    // Format directly to UTC string using date-fns
    return format(date, "yyyy-MM-dd HH:mm:ss", { timeZone: 'UTC' });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B45309" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Post not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={18} color="#000" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isCurrentUserAuthor = user?.id === post.authorId || 
                             user?.login === 'undereighteen';

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>{/* Back and Action Buttons Row */}
<View style={styles.headerRow}>
  <TouchableOpacity
    style={styles.backButton}
    onPress={() => navigation.goBack()}
  >
    <Icon name="arrow-left" size={18} color="#000" />
    <Text style={styles.backButtonText}>Back</Text>
  </TouchableOpacity>

  {/* Action Buttons */}
  {isCurrentUserAuthor && (
    <View style={styles.actionButtonsContainer}>
      <TouchableOpacity 
        style={styles.editButton}
        onPress={() => navigation.navigate('PostEdit', { postId: post.id })}
      >
        <Icon name="edit-2" size={18} color="#000" />
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={handleDeletePost}
      >
        <Icon name="trash-2" size={18} color="#FFF" />
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  )}
</View>

          

          {/* Post Card */}
          <View style={styles.postCard}>
            {/* Header */}
            <View style={styles.postHeader}>
              <View style={styles.profileSection}>
                <View style={styles.avatar}>
                  {post.author.avatar ? (
                    <Image
                      source={{ uri: post.author.avatar }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <Text style={styles.avatarText}>
                      {post.author.name[0].toUpperCase()}
                    </Text>
                  )}
                </View>
                <View style={styles.authorInfo}>
                  <Text style={styles.authorName}>{post.author.name}</Text>
                  <View style={styles.dateContainer}>
                    <Icon name="calendar" size={14} color="#6B7280" />
                    <Text style={styles.dateText}>
                      {formatDate(post.created_at)}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={handleShare}
                  disabled={isSharing}
                >
                  <Icon name="share-2" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <Text style={styles.postContent}>{post.content}</Text>

              {/* Images */}
              {post.images && post.images.length > 0 && (
                <ScrollView
                  horizontal
                  style={styles.imageScroll}
                  showsHorizontalScrollIndicator={false}
                >
                  {post.images.map((imageUrl, index) => (
                    <Image
                      key={`image-${index}`}
                      source={{ uri: imageUrl }}
                      style={styles.postImage}
                      resizeMode="cover"
                    />
                  ))}
                </ScrollView>
              )}

              {/* Audio Files */}
              {post.audioFiles && post.audioFiles.length > 0 && (
                <View style={styles.audioContainer}>
                  {post.audioFiles.map((audioUrl, index) => (
                    <AudioPlayer
                      key={`${post.id}-audio-${index}`}
                      audioUrl={audioUrl}
                      index={index}
                      postId={post.id}
                      isScreenFocused={isFocused}
                      currentlyPlaying={currentAudioPlaying === audioUrl}
                      onPlayStateChange={(isPlaying) => {
                        if (isPlaying) {
                          setCurrentAudioPlaying(audioUrl);
                        } else if (currentAudioPlaying === audioUrl) {
                          setCurrentAudioPlaying(null);
                        }
                      }}
                    />
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  postHeader: {
    flex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  authorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  shareButton: {
    padding: 8,
  },
  postContent: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
    marginBottom: 16,
  },
  imageScroll: {
    marginBottom: 16,
  },
  postImage: {
    width: IMAGE_WIDTH,
    height: IMAGE_WIDTH,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#F3F4F6',
  },
  audioContainer: {
    marginVertical: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  editButton: {
    backgroundColor: '#3B82F6',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  editButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#000000',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  deleteButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#FFFFFF',
  },

});

export default PostDetailsScreen;