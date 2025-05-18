import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  FlatList,
  RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { globalStyles } from '../styles/globalStyles';
import { useAuth } from '../contexts/AuthContext'; 
import PostCard from '../components/PostCard';

export interface IPage {
  id: string;
  updated_at: number;
  created_at: number;
  name: string;
  authorId: string;
  avatar: string;
  members: string[];
  bio?: string;
  path: string;
}

export interface IPost {
  id: string;
  created_at: number;
  authorId: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  };
  content: string;
  images: string[];
  audioFiles: string[];
  videos: string[];
  category: string;
  likes: number;
  comments: number;
  likedBy: string[];
  visibility: 'public' | 'private';
  pinned: boolean;
  pageId?: string;
}

const { width } = Dimensions.get('window');

const DefaultPageImage = ({ name }: { name?: string }) => (
  <View style={styles.avatarContainer}>
    <Text style={styles.avatarText}>
      {name && name.length > 0 ? name[0].toUpperCase() : 'P'}
    </Text>
  </View>
);

type PagesScreenRouteProp = RouteProp<{ params: { pageId: string } }, 'params'>;

interface PagesScreenProps {
  route: PagesScreenRouteProp;
}

const PagesScreen: React.FC<PagesScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const { pageId } = route.params;
  const { user } = useAuth();
  const [pageInfo, setPageInfo] = useState<IPage | null>(null);
  const [pagePosts, setPagePosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // PostCard audio state
  const [currentlyPlayingPostId, setCurrentlyPlayingPostId] = useState<string | null>(null);
  const [playingTrackIndex, setPlayingTrackIndex] = useState<number>(0);

  useEffect(() => {
    fetchPageInfo();
    fetchPagePosts();
  }, [pageId]);

  const fetchPageInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = `https://proxy.hostakkhor.com/proxy/getsorted?keys=hostakkhor_pages_${pageId}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data?.result?.[0]?.value) {
        setPageInfo(data.result[0].value);
        setImageError(false);
      } else {
        throw new Error('No page data found');
      }
    } catch (error) {
      setError('Failed to load page information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPagePosts = async () => {
    try {
      setPostsLoading(true);
      const url = `https://proxy.hostakkhor.com/proxy/getsorted?keys=hostakkhor_posts_*&skip=0&limit=1000`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data?.result && Array.isArray(data.result)) {
        const posts = data.result
          .map((item: any) => item.value)
          .filter((post: IPost) => {
            return post.authorId === pageId || post.pageId === pageId;
          })
          .sort((a: IPost, b: IPost) => b.created_at - a.created_at);
        setPagePosts(posts);
      } else {
        setPagePosts([]);
      }
    } catch (error) {
      setError('Failed to load page posts. Please try again.');
    } finally {
      setPostsLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Page',
      'Are you sure you want to delete this page? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const url = `https://proxy.hostakkhor.com/proxy/remove?key=hostakkhor_pages_${pageId}`;
              const response = await fetch(url, { method: 'GET' });
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              const result = await response.json();
              if (result.result === 1) {
                Alert.alert('Success', 'Page deleted successfully.');
                navigation.goBack();
              } else {
                throw new Error('Failed to delete the page.');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete the page. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const formatDate = (timestamp: number): string => {
    if (!timestamp) return 'Unknown date';
    try {
      const date = new Date(timestamp);
      return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    Promise.all([fetchPageInfo(), fetchPagePosts()])
      .finally(() => setRefreshing(false));
  };

  // Only allow editing, deleting, and post creation if user is author
  const isAuthor = user && (user.id === pageInfo?.authorId);

  const renderPostItem = ({ item }: { item: IPost }) => (
    <View style={styles.postCardWrapper}>
      <PostCard
        post={item}
        onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
        currentlyPlayingPostId={currentlyPlayingPostId}
        setCurrentlyPlayingPostId={setCurrentlyPlayingPostId}
        playingTrackIndex={playingTrackIndex}
        setPlayingTrackIndex={setPlayingTrackIndex}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.center, styles.container]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, styles.container]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={handleRefresh}
        >
          <Icon name="refresh" size={16} color="#fff" />
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!pageInfo) {
    return (
      <View style={[styles.center, styles.container]}>
        <Text style={styles.errorText}>Page not found</Text>
        <TouchableOpacity 
          style={styles.backButtonContainer}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={16} color="#000" />
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Decide what to show for avatar: show image if exists and no error, otherwise first letter of name
  const showAvatarImage = pageInfo.avatar && !imageError;

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      >

        {/* Page Header */}
        <View style={styles.pageHeader}>
          {showAvatarImage ? (
            <Image 
              source={{ uri: pageInfo.avatar }}
              style={styles.avatar}
              onError={() => setImageError(true)}
            />
          ) : (
            <DefaultPageImage name={pageInfo.name} />
          )}
          <Text style={styles.pageTitle}>{pageInfo.name || 'Page Title'}</Text>
          <Text style={styles.dateText}>Created {formatDate(pageInfo.created_at)}</Text>
          {isAuthor && (
            <TouchableOpacity
              style={styles.createPostButton}
              onPress={() =>
                navigation.navigate('CreatePost', { pageId: pageInfo.id, pageName: pageInfo.name })
              }
            >
              <Icon name="plus" size={16} color="#fff" />
              <Text style={styles.createPostButtonText}>Create Post</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* About Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{pageInfo.bio || 'No description available.'}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="copy" size={16} color="#374151" />
            <Text style={styles.actionButtonText}>Copy Link</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="share-alt" size={16} color="#374151" />
            <Text style={styles.actionButtonText}>Share Page</Text>
          </TouchableOpacity>
          {isAuthor && (
            <>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('EditPage', { pageId: pageId })}
              >
                <Icon name="pencil" size={16} color="#374151" />
                <Text style={styles.actionButtonText}>Edit Page</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
                <Icon name="trash" size={16} color="#DC2626" />
                <Text style={styles.deleteButtonText}>Delete Page</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>All Posts</Text>
          </TouchableOpacity>
        </View>

        {/* Posts List */}
        {postsLoading ? (
          <ActivityIndicator size="small" color="#000" style={{ marginVertical: 20 }} />
        ) : pagePosts.length > 0 ? (
          <FlatList
            data={pagePosts}
            renderItem={renderPostItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.postsList}
          />
        ) : (
          <View style={styles.noPostsContainer}>
            <Text style={styles.noPostsText}>No posts found for this page.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#000',
  },
  pageHeader: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '500',
    color: '#374151',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  createPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B45309',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  createPostButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  sectionContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  bioText: {
    fontSize: 16,
    color: '#4B5563',
  },
  actionButtonsContainer: {
    marginVertical: 16,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
  },
  deleteButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#DC2626',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  tab: {
    marginRight: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  activeTab: {
    backgroundColor: '#B45309',
  },
  tabText: {
    fontSize: 14,
    color: '#374151',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  noPostsContainer: {
    padding: 16,
    alignItems: 'center',
  },
  noPostsText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    marginBottom: 16,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  postsList: {
    paddingBottom: 20,
    paddingHorizontal: 12, // Padding for the list
  },
  postCardWrapper: {
    paddingVertical: 8,
    paddingHorizontal: 4, // Padding around each PostCard
  },
});

export default PagesScreen;