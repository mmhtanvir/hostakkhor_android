import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  ImageBackground,
  Modal,
  Animated,
  Dimensions,
  PanResponder,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  FlatList
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { globalStyles, colors } from '../styles/globalStyles';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';
import { ScreenProps } from '../types/navigation';

const { width: screenWidth } = Dimensions.get('window');

const DefaultProfileImage = ({ size }) => (
  <View 
    style={[
      size === 'large' ? globalStyles.profileImageLarge : globalStyles.pinnedProfileImageLarge,
      { backgroundColor: '#e1e1e1', justifyContent: 'center', alignItems: 'center' }
    ]}
  >
    <Icon name="user" size={size === 'large' ? 40 : 30} color="#888" />
  </View>
);

const DefaultPageAvatar = ({ name }) => (
  <View style={styles.pageAvatarFallback}>
    <Text style={styles.pageAvatarFallbackText}>
      {name && name.length > 0 ? name[0].toUpperCase() : 'P'}
    </Text>
  </View>
);

const ProfileScreen = ({ route, navigation }: ScreenProps<'Profile'>) => {
  const { userId } = route.params;
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Posts');
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);
  const [pinnedImageError, setPinnedImageError] = useState(false);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [userPages, setUserPages] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [searchPostsQuery, setSearchPostsQuery] = useState('');
  const [searchPagesQuery, setSearchPagesQuery] = useState('');
  const [currentlyPlayingPostId, setCurrentlyPlayingPostId] = useState<string | null>(null);
  const [playingTrackIndex, setPlayingTrackIndex] = useState(0);

  const translateX = useRef(new Animated.Value(0)).current;
  const underlineTranslateX = useRef(new Animated.Value(0)).current;

  // Fetch by userId so the screen always matches the profile being viewed
  const loadUserData = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const response = await fetch(
        `https://proxy.hostakkhor.com/proxy/get?key=hostakkhor_users_${userId}`
      );
      if (!response.ok) throw new Error('Failed to fetch user');
      const data = await response.json();
      setUserDetails(data);
      if (data?.pinnedPostTheme) {
        setSelectedTheme(data.pinnedPostTheme);
      } else {
        setSelectedTheme('default');
      }
    } catch (error) {
      setUserDetails(null);
      setSelectedTheme('default');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch posts by authorId = userId
  const fetchUserPosts = async () => {
    if (!userId) return;
    try {
      setPostsLoading(true);
      const response = await fetch(`https://proxy.hostakkhor.com/proxy/getsorted?keys=hostakkhor_posts_*&skip=0&limit=1000`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      if (data.result && Array.isArray(data.result)) {
        const posts = data.result
          .map((item: any) => item.value)
          .filter((post: any) => post.authorId === userId)
          .sort((a: any, b: any) => b.created_at - a.created_at);
        setUserPosts(posts);
      } else {
        setUserPosts([]);
      }
    } catch (error) {
      setUserPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  // Fetch pages by authorId = userId
  const fetchUserPages = async () => {
    if (!userId) return;
    try {
      setPagesLoading(true);
      const response = await fetch(`https://proxy.hostakkhor.com/proxy/getsorted?keys=hostakkhor_pages_*&skip=0&limit=1000`);
      if (!response.ok) throw new Error('Failed to fetch pages');
      const data = await response.json();
      if (data.result && Array.isArray(data.result)) {
        const pages = data.result
          .map((item: any) => item.value)
          .filter((page: any) => page.authorId === userId)
          .sort((a: any, b: any) => b.created_at - a.created_at);
        setUserPages(pages);
      } else {
        setUserPages([]);
      }
    } catch (error) {
      setUserPages([]);
    } finally {
      setPagesLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
    fetchUserPosts();
    fetchUserPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserData();
      fetchUserPosts();
      fetchUserPages();
    });
    return unsubscribe;
  }, [navigation, userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadUserData(), fetchUserPosts(), fetchUserPages()]);
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'Unknown date';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const switchTab = (tab: string) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: tab === 'Posts' ? 0 : -screenWidth,
          useNativeDriver: true,
        }),
        Animated.spring(underlineTranslateX, {
          toValue: tab === 'Posts' ? 0 : screenWidth / 2,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const filteredPosts = userPosts.filter(post => 
    (post.content?.toLowerCase().includes(searchPostsQuery.toLowerCase()) ||
    (post.category?.toLowerCase().includes(searchPostsQuery.toLowerCase()))
  ));

  const filteredPages = userPages.filter(page =>
    (page.name?.toLowerCase().includes(searchPagesQuery.toLowerCase()) ||
    (page.bio?.toLowerCase().includes(searchPagesQuery.toLowerCase())))
  );

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dx, dy } = gestureState;
        return Math.abs(dx) > Math.abs(dy * 2) && Math.abs(dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        const { dx } = gestureState;
        let newPosition = activeTab === 'Posts' ? dx : -screenWidth + dx;
        if (newPosition > 0) newPosition = 0;
        if (newPosition < -screenWidth) newPosition = -screenWidth;
        translateX.setValue(newPosition);

        const progress = Math.abs(newPosition) / screenWidth;
        underlineTranslateX.setValue(screenWidth * progress / 2);
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx, vx } = gestureState;
        const shouldSwitchTabs = 
          (Math.abs(dx) > screenWidth * 0.3) || 
          (Math.abs(vx) > 0.5);

        if (shouldSwitchTabs) {
          if (activeTab === 'Posts' && dx < 0) {
            switchTab('Pages');
          } else if (activeTab === 'Pages' && dx > 0) {
            switchTab('Posts');
          } else {
            switchTab(activeTab);
          }
        } else {
          switchTab(activeTab);
        }
      },
    })
  ).current;

  const renderProfileImage = () => {
    if (userDetails?.profileImageUrl && !profileImageError) {
      return (
        <Image 
          source={{ uri: userDetails.profileImageUrl }} 
          style={[globalStyles.profileImageLarge, { width: 80, height: 80, borderRadius: 40 }]}
          onError={() => setProfileImageError(true)}
        />
      );
    }
    return <DefaultProfileImage size="large" />;
  };

  const renderPinnedProfileImage = () => {
    if (userDetails?.profileImageUrl && !pinnedImageError) {
      return (
        <Image 
          source={{ uri: userDetails.profileImageUrl }}
          style={[globalStyles.pinnedProfileImageLarge, { width: 60, height: 60, borderRadius: 30 }]}
          onError={() => setPinnedImageError(true)}
        />
      );
    }
    return <DefaultProfileImage size="small" />;
  };

  const renderPageItem = ({ item }: { item: any }) => {
    const showAvatar = item.avatar && typeof item.avatar === 'string' && item.avatar.startsWith('http');
    return (
      <TouchableOpacity
        style={styles.pageCard}
        onPress={() => navigation.navigate('Pages', { pageId: item.id })}
      >
        {showAvatar ? (
          <Image source={{ uri: item.avatar }} style={styles.pageAvatar} />
        ) : (
          <DefaultPageAvatar name={item.name} />
        )}
        <View style={styles.pageContent}>
          <Text style={styles.pageName}>{item.name}</Text>
          <Text style={styles.pageBio} numberOfLines={2}>
            {item.bio || 'No bio available'}
          </Text>
          <Text style={styles.pageDate}>
            Created {formatDate(item.created_at)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Header showProfile />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={{ flex: 1 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#000000']}
          tintColor={'#000000'}
          progressBackgroundColor={'#ffffff'}
        />
      }
    >
      <View style={globalStyles.container}>
        <Header showProfile />

        <View style={globalStyles.profileCard}>
          {renderProfileImage()}
          
          <Text style={globalStyles.profileName}>
            {userDetails?.name || 'No name provided'}
          </Text>
          
          <Text style={globalStyles.profileEmail}>
            {userDetails?.email || 'No email provided'}
          </Text>
          
          <Text style={globalStyles.profileDate}>
            Joined {formatDate(userDetails?.created_at)}
          </Text>
          
          {userId === user?.id && (
            <TouchableOpacity
              style={globalStyles.editProfileButton}
              onPress={() => navigation.navigate('EditProfile', { userId })}
            >
              <Icon name="pencil" size={14} color="#000" style={{ marginRight: 6 }} />
              <Text style={globalStyles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={globalStyles.tabButtonContainer}>
          <TouchableOpacity
            style={[globalStyles.tabButton, activeTab === 'Posts' && globalStyles.activeTabButton]}
            onPress={() => switchTab('Posts')}
          >
            <Text
              style={[
                globalStyles.tabButtonText,
                activeTab === 'Posts' && globalStyles.activeTabButtonText
              ]}
            >
              Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[globalStyles.tabButton, activeTab === 'Pages' && globalStyles.activeTabButton]}
            onPress={() => switchTab('Pages')}
          >
            <Text
              style={[
                globalStyles.tabButtonText,
                activeTab === 'Pages' && globalStyles.activeTabButtonText
              ]}
            >
              Pages
            </Text>
          </TouchableOpacity>

          <Animated.View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              height: 3,
              width: '50%',
              backgroundColor: colors.primary,
              transform: [{ translateX: underlineTranslateX }],
            }}
          />
        </View>

        <Animated.View
          {...panResponder.panHandlers}
          style={{
            flexDirection: 'row',
            width: screenWidth * 2,
            flex: 1,
            transform: [{ translateX }],
          }}
        >
          {/* Posts Tab */}
          <View style={{ width: screenWidth }}>
            <ScrollView 
              style={{ flex: 1 }}
              scrollEventThrottle={16}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 10 }}
            >
              {/* -- Pinned Post Card and Theme Modal triggers -- */}
              <View style={globalStyles.mydesign}>
                <View style={globalStyles.sectionTitleWithIcon}>
                  <Icon name="thumb-tack" size={14} color="#000" />
                  <Text style={globalStyles.sectionTitle}>Pinned Posts</Text>
                </View>
                <View style={globalStyles.filterContainer}>
                  {userId === user?.id && (
                    <TouchableOpacity
                      style={globalStyles.themeButton}
                      onPress={() => setThemeModalVisible(true)}
                    >
                      <Icon name="paint-brush" size={14} color="#fff" />
                      <Text style={[globalStyles.themeButtonText, { marginLeft: 6 }]}>Themes</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <ImageBackground
                source={
                  selectedTheme === 'golden'
                    ? require('../assets/theme-files/golden-theme-bg.png')
                    : require('../assets/theme-files/default-theme-bg.png')
                }
                style={globalStyles.pinnedCardWrapper}
                imageStyle={globalStyles.pinnedCardImage}
              >
                <View style={globalStyles.pinnedTopBar}>
                  <View style={globalStyles.pinnedLabelContainer}>
                    <Icon name="thumb-tack" size={14} color="#B35F24" />
                    <Text style={globalStyles.pinnedLabel}>Pinned Post</Text>
                  </View>
                  <Text style={globalStyles.pinnedDate}>
                    {new Date().toLocaleString()}
                  </Text>
                </View>

                <View style={globalStyles.pinnedProfileImageContainer}>
                  {renderPinnedProfileImage()}
                </View>

                <View style={globalStyles.pinnedUserInfo}>
                  <Text style={globalStyles.pinnedUserName}>
                    {userDetails?.name || 'No name provided'}
                  </Text>
                  <Text style={globalStyles.pinnedUserBio}>
                    {userDetails?.bio || 'No bio available'}
                  </Text>
                </View>

                <View style={globalStyles.pinEmptyOverlay}>
                  <Icon name="thumb-tack" size={24} color="#888" style={{ marginBottom: 8 }} />
                  <Text style={globalStyles.pinEmptyText}>No pinned post available</Text>
                  {userId === user?.id && (
                    <TouchableOpacity style={globalStyles.createPinButton}
                      onPress={() => navigation.navigate('CreatePost')}
                    >
                      <Icon name="thumb-tack" size={12} color="#000" style={{ marginRight: 6 }} />
                      <Text style={globalStyles.createPinText}>Create a post to pin</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ImageBackground>

              {/* -- User Posts with padding around each PostCard -- */}
              <View style={globalStyles.userPostsSection}>
                <View style={globalStyles.sectionTitleWithIcon}>
                  <Icon name="image" size={14} color="#000" />
                  <Text style={globalStyles.sectionTitle}>User Posts</Text>
                </View>
                
                <View style={globalStyles.searchContainer}>
                  <Icon name="search" size={14} color="#888" />
                  <TextInput
                    placeholder="Search posts..."
                    placeholderTextColor="#888"
                    style={globalStyles.searchInput}
                    value={searchPostsQuery}
                    onChangeText={setSearchPostsQuery}
                  />
                </View>

                {postsLoading ? (
                  <ActivityIndicator size="small" color="#000" style={{ marginTop: 20 }} />
                ) : filteredPosts.length > 0 ? (
                  <FlatList
                    data={filteredPosts}
                    renderItem={({ item }) => (
                      <View style={styles.postCardWrapper}>
                        <PostCard
                          post={item}
                          onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
                          isScreenFocused={true}
                          currentlyPlayingPostId={currentlyPlayingPostId}
                          setCurrentlyPlayingPostId={setCurrentlyPlayingPostId}
                          playingTrackIndex={playingTrackIndex}
                          setPlayingTrackIndex={setPlayingTrackIndex}
                        />
                      </View>
                    )}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 12 }}
                    ListEmptyComponent={
                      <Text style={styles.emptyStateText}>
                        {searchPostsQuery ? 'No posts match your search' : 'No posts available'}
                      </Text>
                    }
                  />
                ) : (
                  <Text style={styles.emptyStateText}>
                    {searchPostsQuery ? 'No posts match your search' : 'No posts available'}
                  </Text>
                )}
              </View>
            </ScrollView>
          </View>

          {/* Pages Tab */}
          <View style={{ width: screenWidth }}>
            <ScrollView 
              style={{ flex: 1 }}
              scrollEventThrottle={16}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 10 }}
            >
              <View style={globalStyles.userPostsSection}>
                <View style={globalStyles.sectionTitleWithIcon}>
                  <Icon name="book" size={14} color="#000" />
                  <Text style={globalStyles.sectionTitle}>User Pages</Text>
                </View>
                
                <View style={globalStyles.searchContainer}>
                  <Icon name="search" size={14} color="#888" />
                  <TextInput
                    placeholder="Search pages..."
                    placeholderTextColor="#888"
                    style={globalStyles.searchInput}
                    value={searchPagesQuery}
                    onChangeText={setSearchPagesQuery}
                  />
                </View>

                {pagesLoading ? (
                  <ActivityIndicator size="small" color="#000" style={{ marginTop: 20 }} />
                ) : filteredPages.length > 0 ? (
                  <FlatList
                    data={filteredPages}
                    renderItem={renderPageItem}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 12 }}
                  />
                ) : (
                  <Text style={styles.emptyStateText}>
                    {searchPagesQuery ? 'No pages match your search' : 'No pages available'}
                  </Text>
                )}
              </View>
            </ScrollView>
          </View>
        </Animated.View>

        {/* Theme Modal */}
        <Modal
          visible={themeModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setThemeModalVisible(false)}
        >
          <View style={globalStyles.modalBackdrop}>
            <View style={globalStyles.themeModal}>
              <TouchableOpacity
                onPress={() => setThemeModalVisible(false)}
                style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}
              >
                <Icon name="close" size={20} color="#333" />
              </TouchableOpacity>

              <Text style={globalStyles.modalTitle}>Select Pinned Post Theme</Text>
              <View style={globalStyles.themeOptionsRow}>
                {['default', 'golden'].map((theme) => (
                  <TouchableOpacity
                    key={theme}
                    style={[
                      globalStyles.themeCard,
                      selectedTheme === theme && globalStyles.selectedThemeCard,
                    ]}
                    onPress={() => {
                      setSelectedTheme(theme);
                      setThemeModalVisible(false);
                    }}
                    disabled={userId !== user?.id}
                  >
                    <Text
                      style={[
                        globalStyles.pinnedLabel,
                        { textAlign: 'center', color: selectedTheme === theme ? '#B35F24' : '#000' },
                      ]}
                    >
                      Pinned Post
                    </Text>
                    <Image
                      source={
                        theme === 'golden'
                          ? require('../assets/theme-files/golden-theme-bg.png')
                          : require('../assets/theme-files/default-theme-bg.png')
                      }
                      style={globalStyles.themeCardImage}
                    />
                    <Text style={globalStyles.themeCardLabel}>
                      {theme === 'golden' ? 'Golden' : 'Default'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  emptyStateText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
    fontSize: 14,
  },
  pageCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
    // padding around the page card
    marginHorizontal: 8,
  },
  pageAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#E5E7EB',
  },
  pageAvatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageAvatarFallbackText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#374151',
  },
  pageContent: {
    flex: 1,
  },
  pageName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  pageBio: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  pageDate: {
    fontSize: 12,
    color: '#888',
  },
  postCardWrapper: {
    paddingVertical: 8,
    paddingHorizontal: 4, // Padding around each PostCard
  },
});

export default ProfileScreen;