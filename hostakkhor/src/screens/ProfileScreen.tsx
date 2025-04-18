import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ImageBackground,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { globalStyles } from '../styles/globalStyles';
import Header from '../components/Header';
import { Svg, Path, Circle } from 'react-native-svg';

export const GalleryIcon = ({ width = 20, height = 20, color = '#000' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Path
      d="M21 15l-5-5-11 11"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Path d="M8.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" fill={color} />
  </Svg>
);

export const BookIcon = ({ width = 20, height = 20, color = '#000' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8v18z"
      stroke={color}
      strokeWidth={1.5}
      fill="none"
    />
    <Path
      d="M12 21h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-8v18z"
      stroke={color}
      strokeWidth={1.5}
      fill="none"
    />
    <Path d="M6 7h4M6 10h4M6 13h4M6 16h4" stroke={color} strokeWidth={1} strokeLinecap="round" />
    <Path d="M14 7h4M14 10h4M14 13h4M14 16h4" stroke={color} strokeWidth={1} strokeLinecap="round" />
    <Path d="M12 3v18" stroke={color} strokeWidth={1.5} />
  </Svg>
);

export const SearchIcon = ({ width = 18, height = 18, color = '#888' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const PaintbrushIcon = ({ width = 20, height = 20, color = '#fff' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Circle cx="13.5" cy="6.5" r="0.5" fill={color} />
    <Circle cx="17.5" cy="10.5" r="0.5" fill={color} />
    <Circle cx="8.5" cy="7.5" r="0.5" fill={color} />
    <Circle cx="6.5" cy="12.5" r="0.5" fill={color} />
    <Path
      d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ProfileScreen = () => {
  const [activeTab, setActiveTab] = useState('Posts');
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('default');

  return (
    <View style={globalStyles.container}>
      <Header showProfile />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={globalStyles.profileCard}>
          <Image source={require('../assets/images/post1.jpg')} style={globalStyles.profileImageLarge} />
          <Text style={globalStyles.profileName}>Mahamudul Hasan Tanvir</Text>
          <Text style={globalStyles.profileEmail}>mahamudul.tanvirr@gmail.com</Text>
          <Text style={globalStyles.profileDate}>Joined 15 Apr 2025</Text>
          <TouchableOpacity style={globalStyles.editProfileButton}>
            <Icon name="pencil" size={14} color="#000" style={{ marginRight: 6 }} />
            <Text style={globalStyles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={globalStyles.tabButtonContainer}>
          <TouchableOpacity
            style={[globalStyles.tabButton, activeTab === 'Posts' && globalStyles.activeTabButton]}
            onPress={() => setActiveTab('Posts')}
          >
            <Text style={[globalStyles.tabButtonText, activeTab === 'Posts' && globalStyles.activeTabButtonText]}>
              Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[globalStyles.tabButton, activeTab === 'Pages' && globalStyles.activeTabButton]}
            onPress={() => setActiveTab('Pages')}
          >
            <Text style={[globalStyles.tabButtonText, activeTab === 'Pages' && globalStyles.activeTabButtonText]}>
              Pages
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'Posts' ? (
          <>
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
                  <PaintbrushIcon />
                  <Text style={[globalStyles.themeButtonText, { marginLeft: 6 }]}>Themes</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ImageBackground
              source={require('../assets/theme-files/golden-theme-bg.png')}
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

            <View style={globalStyles.userPostsSection}>
              <View style={globalStyles.sectionTitleWithIcon}>
                <GalleryIcon />
                <Text style={globalStyles.sectionTitle}>User Posts</Text>
              </View>
              <View style={globalStyles.searchContainer}>
                <SearchIcon />
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
          </>
        ) : (
          <View style={globalStyles.userPostsSection}>
            <View style={globalStyles.sectionTitleWithIcon}>
              <BookIcon />
              <Text style={globalStyles.sectionTitle}>User Pages</Text>
            </View>
            <View style={globalStyles.searchContainer}>
              <SearchIcon />
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
        )}
      </ScrollView>

      {/* Theme Modal */}
      <Modal
        visible={themeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setThemeModalVisible(false)}
      >
        <View style={globalStyles.modalBackdrop}>
          <View style={globalStyles.themeModal}>
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
                  <Text style={globalStyles.themeCardLabel}>{theme === 'golden' ? 'Golden' : 'Default'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
       
export default ProfileScreen;
