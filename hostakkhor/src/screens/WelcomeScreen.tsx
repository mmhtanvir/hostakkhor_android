import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { globalStyles } from '../styles/globalStyles';
import Header from '../components/Header';

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

      
    </View>
  );
};

export default WelcomeScreen;