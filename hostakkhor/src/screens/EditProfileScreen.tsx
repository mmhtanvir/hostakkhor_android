import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import { globalStyles } from '../styles/globalStyles';
import { Svg, Path } from 'react-native-svg';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('Mahamudul Hasan Tanvir');
  const [bio, setBio] = useState('');

  return (
    <View style={globalStyles.container}>
      <Header showProfile />

      <ScrollView contentContainerStyle={globalStyles.scrollContainer}>

        {/* Card */}
        <View style={[globalStyles.card, { paddingVertical: 30 }]}>
          <Text style={globalStyles.title}>Edit Profile</Text>

          {/* Avatar with camera icon */}
          <View style={{ alignItems: 'center', marginVertical: 20 }}>
            <View style={{ position: 'relative' }}>
              <Image
                source={{ uri: 'https://i.ibb.co/94s0s8k/IMG-20240417-040532-623.jpg' }}
                style={globalStyles.avatarLarge}
              />
              <TouchableOpacity style={globalStyles.cameraIconContainer}>
                <Image
                  source={{
                    uri: 'https://cdn-icons-png.flaticon.com/512/685/685655.png',
                  }}
                  style={globalStyles.cameraIcon}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Name Input */}
          <Text style={globalStyles.label}>Name</Text>
          <TextInput
            style={globalStyles.input}
            value={name}
            onChangeText={setName}
          />

          {/* Email */}
          <Text style={globalStyles.label}>Email</Text>
          <TextInput
            style={[globalStyles.input, { backgroundColor: '#f4f4f4' }]}
            value="mahamudul.tanvirr@gmail.com"
            editable={false}
          />
          <Text style={globalStyles.caption}>Email cannot be changed</Text>

          {/* Bio */}
          <Text style={globalStyles.label}>About (Bio)</Text>
          <TextInput
            style={globalStyles.textArea}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself"
            multiline
          />

          {/* Buttons */}
          <View style={{ flexDirection: 'row', marginTop: 30, justifyContent: 'space-between' }}>
            <TouchableOpacity
              style={[globalStyles.buttonOutlined, { flex: 1, marginRight: 10 }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={globalStyles.buttonTextOutlined}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[globalStyles.buttonPrimary, { flex: 1, marginLeft: 10 }]}
              onPress={() => console.log('Changes saved')}
            >
              <Text style={globalStyles.editbuttonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default EditProfileScreen;
