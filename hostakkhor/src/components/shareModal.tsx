import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // or use react-native-vector-icons
import facebookIcon from '../assets/facebook.png'; // add icons to assets
import twitterIcon from '../assets/twitter.png';
import whatsappIcon from '../assets/whatsapp.png';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  postUrl: string;
  shareText?: string;
}

const ShareModal = ({ visible, onClose, postUrl, shareText = 'Check this out!' }: ShareModalProps) => {
  const handleShare = async (platform: 'facebook' | 'twitter' | 'whatsapp') => {
    let appUrl = '';
    let fallbackUrl = '';

    switch (platform) {
      case 'facebook':
        appUrl = `fb://facewebmodal/f?href=${encodeURIComponent(postUrl)}`;
        fallbackUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
        break;
      case 'twitter':
        appUrl = `twitter://post?message=${encodeURIComponent(shareText + ' ' + postUrl)}`;
        fallbackUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'whatsapp':
        appUrl = `whatsapp://send?text=${encodeURIComponent(shareText + ' ' + postUrl)}`;
        fallbackUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + postUrl)}`;
        break;
      default:
        return;
    }

    try {
      const supported = await Linking.canOpenURL(appUrl);
      await Linking.openURL(supported ? appUrl : fallbackUrl);
    } catch (error) {
      console.error('Error opening share link:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Share this Post</Text>
          <View style={styles.iconsRow}>
            <TouchableOpacity
              style={[styles.iconWrapper, { backgroundColor: '#1877F2' }]}
              onPress={() => handleShare('facebook')}
            >
              <Image source={facebookIcon} style={styles.icon} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconWrapper, { backgroundColor: '#000' }]}
              onPress={() => handleShare('twitter')}
            >
              <Image source={twitterIcon} style={styles.icon} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconWrapper, { backgroundColor: '#25D366' }]}
              onPress={() => handleShare('whatsapp')}
            >
              <Image source={whatsappIcon} style={styles.icon} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close-circle" size={30} color="#888" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ShareModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  iconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 20,
  },
  iconWrapper: {
    padding: 12,
    borderRadius: 50,
  },
  icon: {
    width: 40,
    height: 40,
  },
  closeButton: {
    marginTop: 8,
  },
});
