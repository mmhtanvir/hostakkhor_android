import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ImageErrorEventData,
  NativeSyntheticEvent,
} from 'react-native';
import { IPost } from '../types/ipost';
import AudioPlayer from './AudioPlayer';

const DEFAULT_IMAGE = require('../assets/audio-placeholder.png');

interface PostCardProps {
  post: IPost;
  onPress: () => void;
  isScreenFocused?: boolean;
  currentlyPlayingPostId: string | null;
  setCurrentlyPlayingPostId: (postId: string | null) => void;
  playingTrackIndex: number;
  setPlayingTrackIndex: (index: number) => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onPress,
  isScreenFocused = true,
  currentlyPlayingPostId,
  setCurrentlyPlayingPostId,
  playingTrackIndex,
  setPlayingTrackIndex,
}) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const isPlaying = currentlyPlayingPostId === post.id;
  const hasAudioFiles = post.audioFiles && post.audioFiles.length > 0;

  // Memoized handlers to prevent unnecessary re-renders
  const handlePlayStateChange = useCallback((shouldPlay: boolean) => {
    if (shouldPlay) {
      setCurrentlyPlayingPostId(post.id);
      setPlayingTrackIndex(currentTrackIndex);
    } else if (isPlaying) {
      setCurrentlyPlayingPostId(null);
    }
  }, [post.id, currentTrackIndex, isPlaying, setCurrentlyPlayingPostId, setPlayingTrackIndex]);

  const handlePreviousTrack = useCallback(() => {
    if (currentTrackIndex > 0) {
      const newIndex = currentTrackIndex - 1;
      setCurrentTrackIndex(newIndex);
      setPlayingTrackIndex(newIndex);
      setCurrentlyPlayingPostId(post.id);
    }
  }, [currentTrackIndex, post.id, setPlayingTrackIndex, setCurrentlyPlayingPostId]);

  const handleNextTrack = useCallback(() => {
    if (currentTrackIndex < (post.audioFiles?.length || 0) - 1) {
      const newIndex = currentTrackIndex + 1;
      setCurrentTrackIndex(newIndex);
      setPlayingTrackIndex(newIndex);
      setCurrentlyPlayingPostId(post.id);
    }
  }, [currentTrackIndex, post.audioFiles?.length, post.id, setPlayingTrackIndex, setCurrentlyPlayingPostId]);

  // Image handling
  const handleImageError = useCallback((e: NativeSyntheticEvent<ImageErrorEventData>) => {
    setImageError(true);
  }, []);

  const handleAvatarError = useCallback((e: NativeSyntheticEvent<ImageErrorEventData>) => {
    setAvatarError(true);
  }, []);

  // Sync track index when global state changes
  useEffect(() => {
    if (!isPlaying) {
      setCurrentTrackIndex(0);
    } else {
      setCurrentTrackIndex(playingTrackIndex);
    }
  }, [currentlyPlayingPostId, playingTrackIndex, isPlaying]);

  // Determine image sources with fallbacks
  const imageSource = React.useMemo(() => {
    if (
      !imageError &&
      post.images &&
      Array.isArray(post.images) &&
      post.images[0] &&
      typeof post.images[0] === 'string' &&
      post.images[0].startsWith('http')
    ) {
      return { uri: post.images[0] };
    }
    return DEFAULT_IMAGE;
  }, [post.images, imageError]);

  const avatarSource = React.useMemo(() => {
    if (!avatarError && post.author.avatar) {
      return { uri: post.author.avatar };
    }
    return null;
  }, [post.author.avatar, avatarError]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.card}>
      <Image
        source={imageSource}
        style={styles.image}
        resizeMode="cover"
        onError={handleImageError}
      />

      <View style={styles.overlay}>
        <View style={styles.contentContainer}>
          <View style={styles.textWrapper}>
            <Text style={styles.author}>{post.author.name}</Text>
            <Text style={styles.content} numberOfLines={3}>
              {post.content}
            </Text>
          </View>

          {hasAudioFiles && (
            <AudioPlayer
              audioUrl={post.audioFiles[currentTrackIndex]}
              index={currentTrackIndex}
              postId={post.id}
              isScreenFocused={isScreenFocused}
              currentlyPlayingPostId={currentlyPlayingPostId}
              playingTrackIndex={playingTrackIndex}
              onPlayStateChange={handlePlayStateChange}
              totalTracks={post.audioFiles.length}
              currentTrackNumber={currentTrackIndex + 1}
              onPreviousTrack={post.audioFiles.length > 1 ? handlePreviousTrack : undefined}
              onNextTrack={post.audioFiles.length > 1 ? handleNextTrack : undefined}
              compact={true}
            />
          )}
        </View>

        <View style={styles.logoWrapper}>
          {avatarSource ? (
            <Image
              source={avatarSource}
              style={styles.logo}
              resizeMode="cover"
              onError={handleAvatarError}
            />
          ) : (
            <View style={styles.initialsContainer}>
              <Text style={styles.initialsText}>
                {post.author.name[0]?.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  image: {
    width: '100%',
    height: 250,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(251, 233, 208, 0.9)',
    padding: 12,
    flexDirection: 'row',
  },
  contentContainer: {
    flex: 1,
    marginRight: 50,
  },
  logoWrapper: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  initialsContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#b45309',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  textWrapper: {
    marginBottom: 8,
  },
  author: {
    fontWeight: 'bold',
    color: '#8B4F17',
    fontSize: 16,
  },
  content: {
    color: '#7A6B5C',
    fontSize: 14,
    marginTop: 4,
  },
});

export default React.memo(PostCard);