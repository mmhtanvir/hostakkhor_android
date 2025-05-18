import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Text,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { SvgUri } from 'react-native-svg';
import { Svg, Path } from 'react-native-svg';
import { globalStyles } from '../styles/globalStyles';
import { useAuth } from '../contexts/AuthContext';

// Default fallback profile image
const DefaultProfileImage = ({ size }) => (
  <View 
    style={[
      size === 'small' ? globalStyles.profileImageLarge : globalStyles.profileImage,
      { width: size === 'small' ? 20 : 40, height: size === 'small' ? 20 : 40 },
      { backgroundColor: '#e1e1e1', justifyContent: 'center', alignItems: 'center' }
    ]}
  >
    <Icon name="user" size={size === 'small' ? 10 : 20} color="#888" />
  </View>
);

// Sign-out icon SVG
const SignOutIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ marginRight: 8 }}>
    <Path
      d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
      stroke="#333"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 17l5-5m0 0l-5-5m5 5H9"
      stroke="#333"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Header = ({
  onLogoPress,
  onProfilePress,
  showSignIn = true,
  showProfile = true,
}: any) => {
  const navigation = useNavigation();
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout, fetchUserDetails } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [userDetails, setUserDetails] = useState<any>(null);

  // Fetch user details by user.id instead of user.email
  useEffect(() => {
    const loadUserDetails = async () => {
      if (user?.id) {
        try {
          // If your fetchUserDetails supports userId, use it. Otherwise, fallback to email.
          const response = await fetchUserDetails(user.id);
          if (response?.result?.[0]?.value) {
            setUserDetails(response.result[0].value);
          } else if (typeof response === 'object') {
            setUserDetails(response);
          }
        } catch (error) {
          setUserDetails(null);
        }
      } else {
        setUserDetails(null);
      }
      setImageError(false);
      setImageLoading(false);
    };
    loadUserDetails();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      setShowDropdown(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'SignIn' }],
      });
    } catch (error) {
      // Handle error
    }
  };

  // Always pass userId for profile navigation.
  const navigateToProfile = () => {
    setShowDropdown(false);
    if (user && user.id) {
      navigation.navigate('Profile', { userId: user.id });
    } else {
      navigation.navigate('SignIn');
    }
  };

  const renderProfileImage = (style: any, dropdownImage = false) => {
    const profileUrl = userDetails?.profileImageUrl;
    if (profileUrl && !imageError) {
      return (
        <TouchableOpacity style={{ position: 'relative' }} onPress={navigateToProfile}>
          <Image
            source={{ uri: profileUrl }}
            style={[style, { width: 40, height: 40, borderRadius: 20 }]}
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
          />
          {imageLoading && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(240, 240, 240, 0.5)',
                borderRadius: 20,
              }}
            >
              <ActivityIndicator size="small" color="#888" />
            </View>
          )}
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity onPress={navigateToProfile}>
        <DefaultProfileImage />
      </TouchableOpacity>
    );
  };

  return (
    <View style={globalStyles.header}>
      {/* Logo */}
      <TouchableOpacity
        onPress={() => {
          setShowDropdown(false);
          navigation.navigate('Home');
        }}
      >
        <SvgUri
          width="40"
          height="40"
          uri="https://files.hostakkhor.com/download/711dffc3-3e8f-4b55-ad6b-f43a2eed6c2e-hotakkhor-logo.svg"
        />
      </TouchableOpacity>

      {/* Right-side action: Sign In or Profile */}
      {!user ? (
        showSignIn && (
          <TouchableOpacity
            onPress={() => navigation.navigate('SignIn')}
            style={globalStyles.signInButton}
          >
            <Text style={globalStyles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        )
      ) : (
        showProfile && (
          <View style={{ position: 'relative' }}>
            <TouchableOpacity
              onPress={() => setShowDropdown(!showDropdown)}
              style={[
                globalStyles.profileButtonContainer,
                { flexDirection: 'row', alignItems: 'center', gap: 8 },
              ]}
            >
              {renderProfileImage(globalStyles.profileButton)}
              {(userDetails?.name || user?.name) && (
                <Text style={globalStyles.profileNameText} numberOfLines={1}>
                  {userDetails?.name || user?.name}
                </Text>
              )}
            </TouchableOpacity>

            {showDropdown && (
              <View style={[globalStyles.dropdown, { right: 0, top: 50 }]}>
                <TouchableOpacity onPress={navigateToProfile} style={globalStyles.dropdownRow}>
                  {renderProfileImage(globalStyles.dropdownProfileImage, true)}
                  <View style={globalStyles.dropdownProfileInfo}>
                    <Text style={globalStyles.dropdownProfileName}>
                      {userDetails?.name || user?.name || 'User'}
                    </Text>
                    {(userDetails?.email || user?.email) && (
                      <Text style={globalStyles.dropdownProfileEmail}>
                        {userDetails?.email || user?.email}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>

                <View style={globalStyles.divider} />

                <TouchableOpacity onPress={handleLogout} style={globalStyles.dropdownRow}>
                  <SignOutIcon />
                  <Text style={globalStyles.dropdownItem}>Log out</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )
      )}
    </View>
  );
};

export default Header;