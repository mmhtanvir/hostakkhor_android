<<<<<<< HEAD
import React, { useEffect, useState, useCallback } from 'react';
=======
import React, { useEffect, useState } from 'react';
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
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
<<<<<<< HEAD
  RefreshControl,
  Modal,
  Pressable,
=======
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
} from 'react-native';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import ShareModal from '../components/shareModal';
import { format } from 'date-fns';
<<<<<<< HEAD
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import AudioPlayer from '../components/AudioPlayer';
=======
import { utcToZonedTime } from 'date-fns-tz';
import AudioPlayer from '../components/AudioPlayer';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013

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

<<<<<<< HEAD
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
=======
const { width: SCREEN_WIDTH } = Dimensions.get('window');
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
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
<<<<<<< HEAD
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);

  // Audio player state for multi-track support
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(false);

  // Pull-to-refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Lightbox state
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
=======
  const [currentAudioPlaying, setCurrentAudioPlaying] = useState<string | null>(null);
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);

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
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013

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
<<<<<<< HEAD
      setPost(data);
    } catch (error: any) {
      console.error('Error fetching post:', error, error.message);
      Alert.alert('Error', 'Failed to load post. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPostDetails();
    setCurrentTrackIndex(0); // Reset audio track on post change

    // Cleanup on component unmount
    return () => {
      setCurrentlyPlaying(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  useEffect(() => {
    if (!isFocused && currentlyPlaying) {
      setCurrentlyPlaying(false);
    }
  }, [isFocused, currentlyPlaying]);

=======
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

>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
  const handleDeletePost = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
<<<<<<< HEAD
        { text: 'Cancel', style: 'cancel' },
=======
        {
          text: 'Cancel',
          style: 'cancel',
        },
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
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
<<<<<<< HEAD
              Alert.alert('Success', 'Post deleted successfully', [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert('Error', 'Failed to delete post. Please try again.');
=======
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
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
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
<<<<<<< HEAD
=======

>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
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

<<<<<<< HEAD
  const formatDate = (timestamp: number): string => {
    try {
      const date = new Date(timestamp);
      return format(date, "yyyy-MM-dd HH:mm:ss");
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const isCurrentUserAuthor =
    user?.id === post?.authorId || user?.login === 'undereighteen';

  // Audio navigation handlers
  const handlePlayStateChange = useCallback((isPlaying: boolean) => {
    setCurrentlyPlaying(isPlaying);
  }, []);

  const handlePreviousTrack = () => {
    setCurrentTrackIndex((prev) => (prev > 0 ? prev - 1 : prev));
    setCurrentlyPlaying(false);
  };

  const handleNextTrack = () => {
    if (!post?.audioFiles) return;
    setCurrentTrackIndex((prev) =>
      prev < post.audioFiles.length - 1 ? prev + 1 : prev
    );
    setCurrentlyPlaying(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPostDetails();
  };

  // Lightbox open/close handlers
  const openLightbox = (imageUrl: string) => {
    setLightboxImage(imageUrl);
    setLightboxVisible(true);
  };
  const closeLightbox = () => {
    setLightboxVisible(false);
    setLightboxImage(null);
  };
=======
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
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013

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

<<<<<<< HEAD
  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {/* Header Row with Edit/Delete */}
          <View style={styles.headerRow}>
            <View style={styles.actionButtonsContainer}>
              {isCurrentUserAuthor && (
                <>
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
                </>
              )}
            </View>
          </View>

          {/* Post Card */}
          <View style={styles.postCard}>
            {/* Post Header */}
=======
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
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
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
<<<<<<< HEAD
                      {post.author.name[0]?.toUpperCase()}
=======
                      {post.author.name[0].toUpperCase()}
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
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
<<<<<<< HEAD
                <TouchableOpacity onPress={() => setIsShareModalVisible(true)}>
                  <Icon name="share-2" size={24} color="#666" />
                </TouchableOpacity>
                {post && (
                  <ShareModal
                    visible={isShareModalVisible}
                    onClose={() => setIsShareModalVisible(false)}
                    post={post}
                  />
                )}
              </View>
            </View>

            {/* Content */}
            <Text style={styles.postContent}>{post.content}</Text>

            {/* Images with Lightbox */}
            {post.images && post.images.length > 0 && (
              <ScrollView
                horizontal
                style={styles.imageScroll}
                showsHorizontalScrollIndicator={false}
              >
                {post.images.map((imageUrl, index) => (
                  <TouchableOpacity
                    key={`image-${index}`}
                    onPress={() => openLightbox(imageUrl)}
                    activeOpacity={0.85}
                  >
                    <Image
=======
      <TouchableOpacity onPress={() => setIsShareModalVisible(true)}>
        <Icon name="share-2" size={24} color="#666" />
      </TouchableOpacity>

      {post && (
        <ShareModal
          visible={isShareModalVisible}
          onClose={() => setIsShareModalVisible(false)}
          post={post}
        />
      )}
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
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
                      source={{ uri: imageUrl }}
                      style={styles.postImage}
                      resizeMode="cover"
                    />
<<<<<<< HEAD
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Audio Files */}
            {post.audioFiles && post.audioFiles.length > 0 && (
              <View style={styles.audioContainer}>
                <AudioPlayer
                  audioUrl={post.audioFiles[currentTrackIndex]}
                  index={currentTrackIndex}
                  postId={post.id}
                  isScreenFocused={isFocused}
                  currentlyPlaying={currentlyPlaying}
                  onPlayStateChange={handlePlayStateChange}
                  // Multi-track support
                  totalTracks={post.audioFiles.length}
                  currentTrackNumber={currentTrackIndex + 1}
                  onPreviousTrack={
                    post.audioFiles.length > 1 ? handlePreviousTrack : undefined
                  }
                  onNextTrack={
                    post.audioFiles.length > 1 ? handleNextTrack : undefined
                  }
                  compact={true}
                />
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Lightbox Modal */}
      <Modal
        visible={lightboxVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeLightbox}
      >
        <Pressable style={styles.lightboxOverlay} onPress={closeLightbox}>
          <Image
            source={lightboxImage ? { uri: lightboxImage } : undefined}
            style={styles.lightboxImage}
            resizeMode="contain"
          />
        </Pressable>
      </Modal>
=======
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
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
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
<<<<<<< HEAD
    backgroundColor: '#B45309',
=======
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
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
<<<<<<< HEAD
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
=======
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
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
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
<<<<<<< HEAD
    marginLeft: 8,
  },
=======
  },
  
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
<<<<<<< HEAD
=======
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
>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
  deleteButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#FFFFFF',
  },
<<<<<<< HEAD
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  lightboxOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    maxHeight: '90%',
    maxWidth: '98%',
    borderRadius: 12,
  },
=======

>>>>>>> 766e8da14fcdb46a5ff8e3d57f8326556edce013
});

export default PostDetailsScreen;