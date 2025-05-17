import React, { useEffect, useState, useCallback } from 'react';
import {
  FlatList,
  TouchableOpacity,
  Text,
  View,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
  LogBox,
  ScrollView,
} from 'react-native';
import Header from '../components/Header';
import { globalStyles, colors, fonts } from '../styles/globalStyles';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { IPost } from '../types/ipost';
import { Svg, Path, Line, Polyline } from 'react-native-svg';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';

const API_BASE_URL = 'https://proxy.hostakkhor.com/proxy';
const POSTS_PER_PAGE = 100;

const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filter, setFilter] = useState<string>('All');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  // Global audio state for PostCards
  const [currentlyPlayingPostId, setCurrentlyPlayingPostId] = useState<string | null>(null);
  const [playingTrackIndex, setPlayingTrackIndex] = useState<number>(0);

  LogBox.ignoreLogs(['Encountered two children with the same key']);

  const fetchPosts = async (reset: boolean = false) => {
    try {
      if (reset) {
        setPage(0);
        setLoading(true);
        setPosts([]);
      } else {
        setLoadingMore(true);
      }

      const skip = reset ? 0 : page * POSTS_PER_PAGE;
      const url = `${API_BASE_URL}/getsorted?keys=hostakkhor_posts_*&skip=${skip}&limit=${POSTS_PER_PAGE}`;

      const response = await fetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.result && Array.isArray(data.result)) {
        const validPosts = data.result
          .map((item: any) => item.value)
          .filter((post: IPost) => {
            // Allow posts with content, images, or audioFiles (for audio-only visibility!)
            return (
              post &&
              post.id &&
              (
                post.content ||
                (post.images && post.images.length > 0) ||
                (post.audioFiles && post.audioFiles.length > 0)
              )
            );
          });

        const uniquePosts = validPosts.reduce((acc: IPost[], current: IPost) => {
          const exists = acc.find((post) => post.id === current.id);
          if (!exists) {
            acc.push(current);
          }
          return acc;
        }, []);

        uniquePosts.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setPosts((prev) => {
          if (reset) return uniquePosts;
          const combined = [...prev, ...uniquePosts];
          return Array.from(new Map(combined.map(post => [post.id, post])).values());
        });

        setHasMore(uniquePosts.length === POSTS_PER_PAGE);
        setPage((prev) => (reset ? 1 : prev + 1));
      } else {
        console.error('Unexpected response structure:', data);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPosts(true);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts(true);
  }, []);

  const loadMorePosts = useCallback(() => {
    if (!loading && !loadingMore && hasMore) {
      fetchPosts();
    }
  }, [loading, loadingMore, hasMore]);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      (post.author?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.content?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filter === 'All' || post.category === filter;
    return matchesSearch && matchesFilter;
  });

  const categories = ['All', ...new Set(posts.map(post => post.category).filter(Boolean))];

  const PenIcon = () => (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M12 20h9" stroke={colors.black} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke={colors.black} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const PageIcon = () => (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Polyline points="14 2 14 8 20 8" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="16" y1="13" x2="8" y2="13" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="16" y1="17" x2="8" y2="17" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Polyline points="10 9 9 9 8 9" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const PencilIcon = () => (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const SearchIcon = () => (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M21 21l-4.35-4.35M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14z" stroke="#999" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const HomeHeader = () => (
    <>
      <View style={globalStyles.archiveHeader}>
        <PenIcon />
        <Text style={globalStyles.archiveHeaderText}>HANDWRITING ARCHIVE</Text>
      </View>

      <Text style={globalStyles.homeTitle}>
        Preserving Handwriting and Voice for Generations
      </Text>

      <Text style={globalStyles.homeDescription}>
        Hostakkhor helps you digitally preserve personal handwritten documents alongside
        voice recordings, creating a multimedia archive that captures the essence of individual
        expression.
      </Text>

      <TouchableOpacity
        style={globalStyles.actionButton}
        onPress={() => navigation.navigate(user ? 'CreatePage' : 'Welcome')}
        activeOpacity={0.7}
      >
        <View style={globalStyles.actionButtonContent}>
          <PageIcon />
          <Text style={globalStyles.actionButtonText}>Create Your Page</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[globalStyles.actionButton, { marginTop: 12 }]}
        onPress={() => navigation.navigate(user ? 'CreatePost' : 'Welcome')}
        activeOpacity={0.7}
      >
        <View style={globalStyles.actionButtonContent}>
          <PencilIcon />
          <Text style={globalStyles.actionButtonText}>Create a Post</Text>
        </View>
      </TouchableOpacity>

      <Text style={globalStyles.archiveTitle}>Handwriting Archives</Text>
      <Text style={globalStyles.archiveSubtitle}>
        Browse our collection of handwriting samples with accompanying audio recordings.
      </Text>

      <View style={globalStyles.searchContainer}>
        <SearchIcon />
        <TextInput
          placeholder="Search posts..."
          placeholderTextColor={colors.placeholderText}
          style={globalStyles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={globalStyles.filterContainer}
        contentContainerStyle={{ paddingHorizontal: 8 }}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              globalStyles.filterButton,
              filter === category && { backgroundColor: colors.primary },
              filter !== category && {
                backgroundColor: 'transparent',
                borderColor: colors.primary,
              },
            ]}
            onPress={() => setFilter(category)}
          >
            <Text
              style={[
                globalStyles.filterButtonText,
                filter !== category && { color: colors.primary },
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );

  const renderPost = ({ item: post }: { item: IPost }) => (
    <PostCard
      post={post}
      onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
      // Pass global audio state so only one post can play at a time
      currentlyPlayingPostId={currentlyPlayingPostId}
      setCurrentlyPlayingPostId={setCurrentlyPlayingPostId}
      playingTrackIndex={playingTrackIndex}
      setPlayingTrackIndex={setPlayingTrackIndex}
    />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <ActivityIndicator
        size="small"
        color={colors.primary}
        style={{ marginVertical: 20 }}
      />
    );
  };

  const renderEmpty = () => (
    <View style={globalStyles.noPostsContainer}>
      <Text style={globalStyles.noPostsText}>
        {searchQuery || filter !== 'All'
          ? 'No posts found matching your criteria'
          : 'No posts available'}
      </Text>
    </View>
  );

  return (
    <View style={globalStyles.container}>
      <Header
        onLogoPress={() => navigation.navigate('Home')}
        onProfilePress={() => navigation.navigate(user ? 'Profile' : 'SignIn')}
        showSignIn={!user}
        showProfile={!!user}
        profileImageUrl={user?.profileImageUrl}
      />

      <FlatList
        data={filteredPosts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          globalStyles.scrollContent,
          { paddingHorizontal: 16 }
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={HomeHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={!loading ? renderEmpty : null}
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            progressBackgroundColor={colors.white}
          />
        }
      />
    </View>
  );
};

export default HomeScreen;





// cd hostakkhor
// npx react-native run-android
// npx react-native log-android
// npx react-native start --reset-cache
// git status
// git add .
// git commit -m "your message here"
// git push
// npx react-native doctor