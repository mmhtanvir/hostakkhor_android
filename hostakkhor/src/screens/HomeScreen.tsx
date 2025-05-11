import React, { useEffect, useState, useCallback } from 'react';
import { 
  ScrollView, 
  TouchableOpacity, 
  Text, 
  View, 
  TextInput, 
  Image, 
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import Header from '../components/Header';
import { globalStyles } from '../styles/globalStyles';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { IPost } from '../types/ipost'; 
import { Svg, Path, Line, Polyline } from 'react-native-svg';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = 'https://proxy.hostakkhor.com/proxy';

const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth(); // Get user data from auth context
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filter, setFilter] = useState<string>('All');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const fetchPosts = async (reset: boolean = false) => {
    try {
      if (reset) {
        setPage(0);
        setLoading(true);
        setPosts([]);
      }
  
      const skip = reset ? 0 : page * 10;
      const url = `${API_BASE_URL}/getsorted?keys=hostakkhor_posts_*&skip=${skip}&limit=1000`;

      const response = await fetch(url, {
        method: 'GET',
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
  
      if (data.result && Array.isArray(data.result)) {
        const newPosts = data.result.map((item: any) => item.value);
        newPosts.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setPosts((prev) => (reset ? newPosts : [...prev, ...newPosts]));
        setHasMore(newPosts.length === 10);
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
    if (!loading && hasMore) {
      fetchPosts();
    }
  }, [loading, hasMore]);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.author?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         post.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'All' || post.category === filter;
    return matchesSearch && matchesFilter;
  });

  const categories = ['All', ...new Set(posts.map(post => post.category).filter(Boolean))];

  const PenIcon = () => (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M12 20h9" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

  return (
    <View style={globalStyles.container}>
      <Header
        onLogoPress={() => navigation.navigate('Home')}
        onProfilePress={() => navigation.navigate('Profile')}
        showSignIn={false}
        showProfile={true}
        profileImageUrl={user?.profileImageUrl} // Pass user's profile image to Header
      />

      <ScrollView 
        style={globalStyles.content} 
        contentContainerStyle={globalStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#000000']}
            tintColor={'#000000'}
            progressBackgroundColor={'#ffffff'}
          />
        }
        scrollEventThrottle={400}
      >
        {/* ... rest of the HomeScreen content remains the same ... */}
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
          onPress={() => navigation.navigate('CreatePage')}
          activeOpacity={0.7}
        >
          <View style={globalStyles.actionButtonContent}>
            <PageIcon />
            <Text style={globalStyles.actionButtonText}>Create Your Page</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[globalStyles.actionButton, { marginTop: 12 }]}
          onPress={() => navigation.navigate('CreatePost')}
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
            placeholderTextColor="#aaa"
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
              style={[globalStyles.filterButton, filter === category && globalStyles.filterButtonActive]}
              onPress={() => setFilter(category)}
            >
              <Text style={[globalStyles.filterButtonText, filter === category && globalStyles.filterButtonTextActive]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading && !refreshing && posts.length === 0 ? (
          <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <TouchableOpacity
              key={post.id}
              style={globalStyles.postCard}
              onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
              activeOpacity={0.8}
            >
              {post.images?.[0] ? (
                <Image
                  source={{ uri: post.images[0] }}
                  style={globalStyles.postImage}
                  resizeMode="cover"
                  onError={() => console.log('Image load failed')}
                />
              ) : (
                <View style={[globalStyles.postImage, globalStyles.postImagePlaceholder]}>
                  <Text style={globalStyles.postImagePlaceholderText}>No Image</Text>
                </View>
              )}

              <View style={globalStyles.postInfo}>
                <Text style={globalStyles.postAuthor} numberOfLines={1}>
                  {post.author?.name || 'Unknown'}
                </Text>
                {post.category && (
                  <Text style={globalStyles.postLocation} numberOfLines={1}>
                    {post.category}
                  </Text>
                )}
                {post.content && (
                  <Text style={globalStyles.postContent} numberOfLines={2}>
                    {post.content}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={globalStyles.noPostsContainer}>
            <Text style={globalStyles.noPostsText}>
              {searchQuery || filter !== 'All' 
                ? 'No posts found matching your criteria' 
                : 'No posts available'}
            </Text>
          </View>
        )}

        {loading && posts.length > 0 && (
          <ActivityIndicator size="small" color="#000" style={{ marginVertical: 20 }} />
        )}
      </ScrollView>
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