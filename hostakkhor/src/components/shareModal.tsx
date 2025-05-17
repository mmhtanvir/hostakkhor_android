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
    path: string; // Add path to properly identify the post
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
  // Generate the post URL using the post's path
  const getPostUrl = () => {
    // Using the post's path to generate the correct URL
    // The path format is typically: hostakkhor_posts_${postId}
    const postPath = post.path.replace('hostakkhor_posts_', '');
    return `https://web.hostakkhor.com/post/${postPath}`;
  };

  const getShareText = () => {
    // Limit content length for sharing
    const maxLength = 100;
    const content = post.content.length > maxLength 
      ? post.content.substring(0, maxLength) + '...' 
      : post.content;
    
    const authorText = post.author?.name ? ` - ${post.author.name}` : '';
    return `${content}${authorText}\n\nRead more on Hostakkhor`;
  };

  const handleShare = async (platform: 'facebook' | 'twitter' | 'whatsapp' | 'native') => {
    const postUrl = getPostUrl();
    const shareText = getShareText();

    if (platform === 'native') {
      try {
        const result = await Share.share({
          message: `${shareText}\n${postUrl}`,
          url: postUrl, // iOS only
          title: 'Share Post', // Android only
        });
        
        if (result.action === Share.sharedAction) {
          onClose(); // Close modal after successful share
        }
      } catch (error) {
        console.error('Error sharing:', error);
      }
      return;
    }

    let appUrl = '';
    let fallbackUrl = '';

    switch (platform) {
      case 'facebook':
        appUrl = `fb://facewebmodal/f?href=${encodeURIComponent(postUrl)}`;
        fallbackUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}&quote=${encodeURIComponent(shareText)}`;
        break;
      case 'twitter':
        // Twitter has a character limit, so we'll need to be more concise
        const twitterText = `${post.content.substring(0, 80)}... ${postUrl}`;
        appUrl = `twitter://post?message=${encodeURIComponent(twitterText)}`;
        fallbackUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'whatsapp':
        const whatsappText = `${shareText}\n${postUrl}`;
        appUrl = `whatsapp://send?text=${encodeURIComponent(whatsappText)}`;
        fallbackUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
        break;
    }

    try {
      const supported = await Linking.canOpenURL(appUrl);
      await Linking.openURL(supported ? appUrl : fallbackUrl);
      onClose(); // Close modal after opening share URL
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
          
          <Text style={styles.title}>Share Post</Text>
          
          <View style={styles.contentPreview}>
            <Text style={styles.previewText} numberOfLines={2}>
              {post.content}
            </Text>
          </View>
          
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
  // ... (previous styles remain the same)
  contentPreview: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  previewText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  // ... (rest of the styles remain the same)
});

export default ShareModal;