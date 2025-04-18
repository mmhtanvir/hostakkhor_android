import React from 'react';
import { ScrollView, TouchableOpacity, Text, View, TextInput, Image } from 'react-native';
import Header from '../components/Header';
import { globalStyles } from '../styles/globalStyles';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Svg, Path, Line, Polyline } from 'react-native-svg';

const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Icons
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

  // Sample post data
  const posts = [
    {
      id: 1,
      author: "John Doe",
      location: "Cairo, Egypt",
      image: require("../assets/images/post1.jpg"),
    },
    {
      id: 2,
      author: "Jane Smith",
      location: "Unknown",
      image: require("../assets/images/post1.jpg"),
    }
  ];

  return (
    <View style={globalStyles.container}>
      <Header
        onLogoPress={() => navigation.navigate('Home')}
        onProfilePress={() => navigation.navigate('Profile')}
        showSignIn={false}      
        showProfile={true}      
      />

      <ScrollView
        style={globalStyles.content}
        contentContainerStyle={globalStyles.scrollContent}
      >
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
        >
          <View style={globalStyles.actionButtonContent}>
            <PageIcon />
            <Text style={globalStyles.actionButtonText}>Create Your Page</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[globalStyles.actionButton, { marginTop: 12 }]}
          onPress={() => navigation.navigate('CreatePost')}
        >
          <View style={globalStyles.actionButtonContent}>
            <PencilIcon />
            <Text style={globalStyles.actionButtonText}>Create a Post</Text>
          </View>
        </TouchableOpacity>

        <Text style={globalStyles.archiveTitle}>Handwriting Archives</Text>
        <Text style={globalStyles.archiveSubtitle}>
          Browse our collection of handwriting samples with accompanying audio recordings.
          Each entry preserves the unique penmanship and voice of the contributor.
        </Text>

        <View style={globalStyles.searchContainer}>
          <SearchIcon />
          <TextInput
            placeholder="Search posts..."
            placeholderTextColor="#aaa"
            style={globalStyles.searchInput}
          />
        </View>

        <View style={globalStyles.filterContainer}>
          <TouchableOpacity style={globalStyles.filterButton}>
            <Text style={globalStyles.filterButtonText}>All</Text>
          </TouchableOpacity>
        </View>

        {posts.map(post => (
          <TouchableOpacity 
            key={post.id}
            style={globalStyles.postCard}
            onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
          >
            <Image 
              source={post.image} 
              style={globalStyles.postImage}
              resizeMode="cover"
            />
            <View style={globalStyles.postInfo}>
              <Text style={globalStyles.postAuthor}>{post.author}</Text>
              <Text style={globalStyles.postLocation}>{post.location}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      
    </View>
  );
};

export default HomeScreen;




// cd hostakkhor
// npx react-native run-android
// npx react-native start --reset-cache
// git add .
// git commit -m "your message here"
// git push