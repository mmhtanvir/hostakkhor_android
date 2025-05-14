import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Linking,
  Platform,
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  post: {
    id: string;
    content: string;
    author?: {
      name: string;
    };
  };
}

const ShareModal: React.FC<ShareModalProps> = ({ 
  visible, 
  onClose, 
  post
}) => {
  // Generate the post URL based on the post ID
  const getPostUrl = () => {
    return `https://hostakkhor.com/posts/${post.id}`;
  };

  // Generate share text including author if available
  const getShareText = () => {
    const authorText = post.author?.name ? ` by ${post.author.name}` : '';
    return `${post.content}${authorText}\n\nShared from Hostakkhor`;
  };

  const handleShare = async (platform: 'facebook' | 'twitter' | 'whatsapp' | 'native') => {
    const postUrl = getPostUrl();
    const shareText = getShareText();

    if (platform === 'native') {
      try {
        await Share.share({
          message: shareText,
          url: postUrl, // iOS only
        });
        return;
      } catch (error) {
        console.error('Error sharing:', error);
        return;
      }
    }

    let appUrl = '';
    let fallbackUrl = '';

    switch (platform) {
      case 'facebook':
        appUrl = `fb://facewebmodal/f?href=${encodeURIComponent(postUrl)}`;
        fallbackUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
        break;
      case 'twitter':
        appUrl = `twitter://post?message=${encodeURIComponent(shareText)}`;
        fallbackUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'whatsapp':
        appUrl = `whatsapp://send?text=${encodeURIComponent(shareText + ' ' + postUrl)}`;
        fallbackUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + postUrl)}`;
        break;
    }

    try {
      const supported = await Linking.canOpenURL(appUrl);
      await Linking.openURL(supported ? appUrl : fallbackUrl);
    } catch (error) {
      console.error('Error opening share link:', error);
      // Fallback to native share if platform-specific sharing fails
      handleShare('native');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.modal}>
          <View style={styles.handle} />
          
          <Text style={styles.title}>Share this Post</Text>
          
          <View style={styles.iconsRow}>
            <TouchableOpacity
              style={[styles.shareButton, { backgroundColor: '#1877F2' }]}
              onPress={() => handleShare('facebook')}
            >
              <Icon name="facebook" size={24} color="#FFF" />
              <Text style={styles.shareButtonText}>Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.shareButton, { backgroundColor: '#000000' }]}
              onPress={() => handleShare('twitter')}
            >
              <Icon name="twitter" size={24} color="#FFF" />
              <Text style={styles.shareButtonText}>Twitter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.shareButton, { backgroundColor: '#25D366' }]}
              onPress={() => handleShare('whatsapp')}
            >
              <Icon name="message-circle" size={24} color="#FFF" />
              <Text style={styles.shareButtonText}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.shareButton, { backgroundColor: '#666666' }]}
              onPress={() => handleShare('native')}
            >
              <Icon name="share-2" size={24} color="#FFF" />
              <Text style={styles.shareButtonText}>More</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 24,
  },
  iconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  shareButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
    borderRadius: 16,
    padding: 12,
  },
  shareButtonText: {
    color: '#FFF',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  cancelButton: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});

export default ShareModal;