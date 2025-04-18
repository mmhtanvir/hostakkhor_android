import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SvgUri } from 'react-native-svg';
import { Svg, Path } from 'react-native-svg';
import { globalStyles } from '../styles/globalStyles';

const Header = ({ onLogoPress, onProfilePress, showSignIn, showProfile }: any) => {
  const navigation = useNavigation();
  const [showDropdown, setShowDropdown] = useState(false);

  const UserIcon = () => (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ marginRight: 8 }}>
      <Path
        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
        stroke="#333"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
        stroke="#333"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );

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

  return (
    <View style={globalStyles.header}>
      {/* Logo */}
      <TouchableOpacity onPress={onLogoPress}>
        <SvgUri
          width="40"
          height="40"
          uri="https://files.hostakkhor.com/download/711dffc3-3e8f-4b55-ad6b-f43a2eed6c2e-hotakkhor-logo.svg"
        />
      </TouchableOpacity>

      {/* Only show dropdown if showProfile is true */}
      {showProfile && (
        <View style={{ position: 'relative' }}>
          <TouchableOpacity onPress={() => setShowDropdown(!showDropdown)}>
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1144/1144760.png' }}
              style={globalStyles.profileButton}
            />
          </TouchableOpacity>

          {showDropdown && (
            <View style={globalStyles.dropdown}>
              <TouchableOpacity
                onPress={() => {
                  setShowDropdown(false);
                  navigation.navigate('Profile');
                }}
                style={globalStyles.dropdownRow}
              >
                <UserIcon />
                <Text style={globalStyles.dropdownItem}>Profile</Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={globalStyles.divider} />

              <TouchableOpacity
                onPress={() => {
                  setShowDropdown(false);
                  navigation.navigate('SignIn');
                }}
                style={globalStyles.dropdownRow}
              >
                <SignOutIcon />
                <Text style={globalStyles.dropdownItem}>Log out</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default Header;