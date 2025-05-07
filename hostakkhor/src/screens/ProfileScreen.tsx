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
  RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { globalStyles, colors } from '../styles/globalStyles';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

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

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, fetchUserDetails } = useAuth();
  const [activeTab, setActiveTab] = useState('Posts');
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);
  const [pinnedImageError, setPinnedImageError] = useState(false);

  const translateX = useRef(new Animated.Value(0)).current;
  const underlineTranslateX = useRef(new Animated.Value(0)).current;

  const loadUserData = async () => {
    if (user?.email) {
      try {
        setLoading(true);
        const response = await fetchUserDetails(user.email);
        const fetchedUser = response.result[0]?.value;
        setUserDetails(fetchedUser);
        if (fetchedUser?.pinnedPostTheme) {
          setSelectedTheme(fetchedUser.pinnedPostTheme);
        }
        console.log('User details loaded:', fetchedUser);
      } catch (error) {
        console.error('Error loading user details:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserData();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 19).replace('T', ' ');
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = new Date(Number(timestamp));
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const switchTab = (tab) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: tab === 'Posts' ? 0 : -screenWidth,
          useNativeDriver: true,
          friction: 10,
          tension: 50,
          restSpeedThreshold: 10,
          restDisplacementThreshold: 10
        }),
        Animated.spring(underlineTranslateX, {
          toValue: tab === 'Posts' ? 0 : screenWidth / 2,
          useNativeDriver: true,
          friction: 10,
          tension: 50,
          restSpeedThreshold: 10,
          restDisplacementThreshold: 10
        }),
      ]).start();
    }
  };

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

        // Update the tab indicator position
        const progress = Math.abs(newPosition) / screenWidth;
        underlineTranslateX.setValue(screenWidth * progress / 2);

        // Update active tab based on swipe position
        if (progress > 0.5 && activeTab === 'Posts') {
          setActiveTab('Pages');
        } else if (progress < 0.5 && activeTab === 'Pages') {
          setActiveTab('Posts');
        }
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
      onPanResponderTerminate: () => {
        switchTab(activeTab);
      },
    })
  ).current;

  const renderProfileImage = () => {
    if (userDetails?.profileImageUrl && !profileImageError) {
      return (
        <Image 
          source={{ 
            uri: userDetails.profileImageUrl,
            cache: 'reload'
          }} 
          style={[globalStyles.profileImageLarge, { width: 80, height: 80, borderRadius: 40 }]}
          onError={() => {
            console.log('Profile image failed to load:', userDetails.profileImageUrl);
            setProfileImageError(true);
          }}
        />
      );
    }
    return <DefaultProfileImage size="large" />;
  };

  const renderPinnedProfileImage = () => {
    if (userDetails?.profileImageUrl && !pinnedImageError) {
      return (
        <Image 
          source={{ 
            uri: userDetails.profileImageUrl,
            cache: 'reload'
          }} 
          style={[globalStyles.pinnedProfileImageLarge, { width: 60, height: 60, borderRadius: 30 }]}
          onError={() => {
            console.log('Pinned profile image failed to load:', userDetails.profileImageUrl);
            setPinnedImageError(true);
          }}
        />
      );
    }
    return <DefaultProfileImage size="small" />;
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
            {userDetails?.name || user?.name || 'No name provided'}
          </Text>
          
          <Text style={globalStyles.profileEmail}>
            {userDetails?.email || user?.email || 'No email provided'}
          </Text>
          
          <Text style={globalStyles.profileDate}>
            Joined {formatDate(userDetails?.created_at)}
          </Text>
          
          <TouchableOpacity
            style={globalStyles.editProfileButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Icon name="pencil" size={14} color="#000" style={{ marginRight: 6 }} />
            <Text style={globalStyles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
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
          <View style={{ width: screenWidth }}>
            <ScrollView 
              style={{ flex: 1 }}
              scrollEventThrottle={16}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 10 }}
            >
              <View style={globalStyles.mydesign}>
                <View style={globalStyles.sectionTitleWithIcon}>
                  <Icon name="thumb-tack" size={14} color="#000" />
                  <Text style={globalStyles.sectionTitle}>Pinned Posts</Text>
                </View>
                <View style={globalStyles.filterContainer}>
                  <TouchableOpacity
                    style={globalStyles.themeButton}
                    onPress={() => setThemeModalVisible(true)}
                  >
                    <Icon name="paint-brush" size={14} color="#fff" />
                    <Text style={[globalStyles.themeButtonText, { marginLeft: 6 }]}>Themes</Text>
                  </TouchableOpacity>
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
                    {getCurrentDateTime()}
                  </Text>
                </View>

                <View style={globalStyles.pinnedProfileImageContainer}>
                  {renderPinnedProfileImage()}
                </View>

                <View style={globalStyles.pinnedUserInfo}>
                  <Text style={globalStyles.pinnedUserName}>
                    {userDetails?.name || user?.name || 'No name provided'}
                  </Text>
                  <Text style={globalStyles.pinnedUserBio}>
                    {userDetails?.bio || 'No bio available'}
                  </Text>
                </View>

                <View style={globalStyles.pinEmptyOverlay}>
                  <Icon name="thumb-tack" size={24} color="#888" style={{ marginBottom: 8 }} />
                  <Text style={globalStyles.pinEmptyText}>No pinned post available</Text>
                  <TouchableOpacity style={globalStyles.createPinButton}>
                    <Icon name="thumb-tack" size={12} color="#000" style={{ marginRight: 6 }} />
                    <Text style={globalStyles.createPinText}>Create a post to pin</Text>
                  </TouchableOpacity>
                </View>
              </ImageBackground>

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
                  />
                </View>
                <View style={globalStyles.filterContainer}>
                  <TouchableOpacity style={globalStyles.filterButton}>
                    <Text style={globalStyles.filterButtonText}>All</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>

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
                  />
                </View>
                <View style={globalStyles.filterContainer}>
                  <TouchableOpacity style={globalStyles.filterButton}>
                    <Text style={globalStyles.filterButtonText}>All</Text>
                  </TouchableOpacity>
                </View>
                <Text style={globalStyles.emptyStateText}>No pages found</Text>
              </View>
            </ScrollView>
          </View>
        </Animated.View>

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

export default ProfileScreen;