import React, { useState, useRef } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { globalStyles, colors } from '../styles/globalStyles';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';

const { width: screenWidth } = Dimensions.get('window');

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('Posts');
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('default');

  const translateX = useRef(new Animated.Value(0)).current;
  const underlineTranslateX = useRef(new Animated.Value(0)).current;

  const switchTab = (tab) => {
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

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx < -50 && activeTab === 'Posts') {
          switchTab('Pages');
        } else if (gestureState.dx > 50 && activeTab === 'Pages') {
          switchTab('Posts');
        }
      },
    })
  ).current;

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={globalStyles.container}>
        <Header showProfile />

        {/* Profile Info */}
        <View style={globalStyles.profileCard}>
          <Image source={require('../assets/images/post1.jpg')} style={globalStyles.profileImageLarge} />
          <Text style={globalStyles.profileName}>Mahamudul Hasan Tanvir</Text>
          <Text style={globalStyles.profileEmail}>mahamudul.tanvirr@gmail.com</Text>
          <Text style={globalStyles.profileDate}>Joined 15 Apr 2025</Text>
          <TouchableOpacity
            style={globalStyles.editProfileButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Icon name="pencil" size={14} color="#000" style={{ marginRight: 6 }} />
            <Text style={globalStyles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={globalStyles.tabButtonContainer}>
          <TouchableOpacity
            style={[globalStyles.tabButton, activeTab === 'Posts' && globalStyles.activeTabButton]}
            onPress={() => switchTab('Posts')}
          >
            <Text style={[globalStyles.tabButtonText, activeTab === 'Posts' && globalStyles.activeTabButtonText]}>
              Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[globalStyles.tabButton, activeTab === 'Pages' && globalStyles.activeTabButton]}
            onPress={() => switchTab('Pages')}
          >
            <Text style={[globalStyles.tabButtonText, activeTab === 'Pages' && globalStyles.activeTabButtonText]}>
              Pages
            </Text>
          </TouchableOpacity>

          {/* Animated underline */}
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

        {/* Content */}
        <Animated.View
          {...panResponder.panHandlers}
          style={{
            flexDirection: 'row',
            width: screenWidth * 2,
            flex: 1,
            transform: [{ translateX: translateX }],
          }}
        >
          {/* Posts Tab */}
          <ScrollView style={{ width: screenWidth, padding: 10 }}>
            {/* Pinned Posts */}
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

            {/* Pinned Post Card */}
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
                <Text style={globalStyles.pinnedDate}>April 18, 2025</Text>
              </View>

              <View style={globalStyles.pinnedProfileImageContainer}>
                <Image source={require('../assets/images/post1.jpg')} style={globalStyles.pinnedProfileImageLarge} />
              </View>

              <View style={globalStyles.pinnedUserInfo}>
                <Text style={globalStyles.pinnedUserName}>Mahamudul Hasan Tanvir</Text>
                <Text style={globalStyles.pinnedUserBio}>No bio available</Text>
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

            {/* User Posts */}
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

          {/* Pages Tab */}
          <ScrollView style={{ width: screenWidth, padding: 10 }}>
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