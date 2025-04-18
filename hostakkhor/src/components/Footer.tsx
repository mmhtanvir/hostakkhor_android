import React from 'react';
import { View, Text } from 'react-native';
import { globalStyles } from '../styles/globalStyles';

const Footer = () => {
  return (
    <View style={globalStyles.footer}>
      <Text style={globalStyles.footerText}>2025 Hostakkhor. All rights reserved.</Text>
    </View>
  );
};

export default Footer;