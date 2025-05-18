import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Linking,
  Platform,
  Share,
  Alert,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
// No need for MaterialCommunityIcons for WhatsApp here

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  post: {
    id: string;
    path: string;
    content: string;
    author?: {
      name: string;
    };
  };
}

const ShareModal: React.FC<ShareModalProps> = ({
  visible,
  onClose,
  post,
}) => {
  const [copied, setCopied] = useState(false);

  // Generate the post URL using the post's path
  const getPostUrl = () => {
    const postPath = post.path.replace('hostakkhor_posts_', '');
    return `https://web.hostakkhor.com/post/${postPath}`;
  };

  const getShareText = () => {
    const maxLength = 100;
    const content =
      post.content.length > maxLength
        ? post.content.substring(0, maxLength) + '...'
        : post.content;

    const authorText = post.author?.name ? ` - ${post.author.name}` : '';
    return `${content}${authorText}\n\nRead more on Hostakkhor`;
  };

  const handleShare = async (
    platform: 'facebook' | 'twitter' | 'whatsapp' | 'native'
  ) => {
    const postUrl = getPostUrl();
    const shareText = getShareText();

    if (platform === 'native') {
      try {
        const result = await Share.share({
          message: `${shareText}\n${postUrl}`,
          url: postUrl,
          title: 'Share Post',
        });

        if (result.action === Share.sharedAction) {
          onClose();
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
        fallbackUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          postUrl
        )}&quote=${encodeURIComponent(shareText)}`;
        break;
      case 'twitter':
        const twitterText = `${post.content.substring(0, 80)}... ${postUrl}`;
        appUrl = `twitter://post?message=${encodeURIComponent(twitterText)}`;
        fallbackUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          postUrl
        )}&text=${encodeURIComponent(shareText)}`;
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
      onClose();
    } catch (error) {
      console.error('Error opening share link:', error);
      handleShare('native');
    }
  };

  const handleCopy = () => {
    const postUrl = getPostUrl();
    // @ts-ignore
    import('@react-native-clipboard/clipboard').then(Clipboard => {
      Clipboard.default.setString(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      Alert.alert('Copied!', 'Post URL copied to clipboard.');
    });
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
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modal}
          onPress={() => {}}
        >
          <View style={styles.handle} />

          <Text style={styles.title}>Share Post</Text>

          <TouchableOpacity
            style={styles.copyLinkButton}
            onPress={handleCopy}
            activeOpacity={0.7}
          >
            <FeatherIcon
              name="copy"
              size={20}
              color={copied ? "#B35F24" : "#555"}
              style={{ marginRight: 8 }}
            />
            <Text
              style={[
                styles.copyLinkText,
                copied && { color: "#B35F24" }
              ]}
            >
              {copied ? "Copied!" : "Copy Post URL"}
            </Text>
          </TouchableOpacity>

          <View style={styles.iconsRow}>
            <TouchableOpacity
              style={[styles.shareButton, { backgroundColor: '#1877F2' }]}
              onPress={() => handleShare('facebook')}
            >
              <FontAwesome name="facebook" size={28} color="#FFF" />
              <Text style={styles.shareButtonText}>Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.shareButton, { backgroundColor: '#1DA1F2' }]}
              onPress={() => handleShare('twitter')}
            >
              <FontAwesome name="twitter" size={28} color="#FFF" />
              <Text style={styles.shareButtonText}>Twitter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.shareButton, { backgroundColor: '#25D366' }]}
              onPress={() => handleShare('whatsapp')}
            >
              <FontAwesome name="whatsapp" size={28} color="#FFF" />
              <Text style={styles.shareButtonText}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.shareButton, { backgroundColor: '#666666' }]}
              onPress={() => handleShare('native')}
            >
              <FeatherIcon name="share-2" size={28} color="#FFF" />
              <Text style={styles.shareButtonText}>More</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </TouchableOpacity>
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
    padding: 20,
    alignItems: 'center',
    minHeight: 320,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.10,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#DDD',
    borderRadius: 2.5,
    marginBottom: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  copyLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEE',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    backgroundColor: '#F8F8F8',
  },
  copyLinkText: {
    fontSize: 15,
    color: '#555',
    fontWeight: '500',
  },
  iconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    marginBottom: 28,
  },
  shareButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
    borderRadius: 16,
    padding: 10,
    marginHorizontal: 2,
    marginVertical: 4,
  },
  shareButtonText: {
    color: '#FFF',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.3,
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
    fontWeight: '600',
  },
});

export default ShareModal;