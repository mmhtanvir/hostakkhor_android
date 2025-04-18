import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { globalStyles } from '../styles/globalStyles';
import Header from '../components/Header';
import Footer from '../components/Footer';

const WelcomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={globalStyles.container}>
      <Header
        onLogoPress={() => navigation.navigate('Home')}
        showSignIn={false}
      />

      <ScrollView
        style={globalStyles.content}
        contentContainerStyle={globalStyles.centeredScrollContent}
      >
        <Text style={globalStyles.welcomeTitle}>Welcome to Hostakkhor</Text>
        <Text style={globalStyles.welcomeSubtitle}>
          Begin your journey preserving handwriting and voices.
        </Text>

        <TouchableOpacity
          style={globalStyles.secondaryButton}
          onPress={() => navigation.navigate('SignIn')}
        >
          <Text style={globalStyles.secondaryButtonText}>Sign In</Text>
        </TouchableOpacity>
      </ScrollView>

      <Footer />
    </View>
  );
};

export default WelcomeScreen;
