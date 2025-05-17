import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import Icon from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

interface AudioPlayerProps {
  audioUrl: string;
  index: number;
  postId: string;
  isScreenFocused: boolean;
  currentlyPlaying: boolean;
  onPlayStateChange: (isPlaying: boolean) => void;
  // Multiple tracks props
  totalTracks?: number;
  currentTrackNumber?: number;
  onPreviousTrack?: () => void;
  onNextTrack?: () => void;
  // Optional style props
  compact?: boolean;
  inPostCard?: boolean; // New prop to style specifically for PostCard
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  index,
  postId,
  isScreenFocused,
  currentlyPlaying,
  onPlayStateChange,
  totalTracks = 1,
  currentTrackNumber = 1,
  onPreviousTrack,
  onNextTrack,
  compact = false,
  inPostCard = false, // Default to false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPositionSec, setCurrentPositionSec] = useState(0);
  const [currentDurationSec, setCurrentDurationSec] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const progressWidth = useRef(new Animated.Value(0)).current;
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;
  
  // Calculate if we need to show track navigation
  const hasMultipleTracks = totalTracks > 1;

  useEffect(() => {
    if (!isScreenFocused && isPlaying) {
      stopPlaying();
    }
  }, [isScreenFocused]);

  useEffect(() => {
    if (!currentlyPlaying && isPlaying) {
      stopPlaying();
    }
  }, [currentlyPlaying]);

  useEffect(() => {
    Animated.timing(progressWidth, {
      toValue: (currentPositionSec / currentDurationSec) * 100 || 0,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [currentPositionSec, currentDurationSec]);

  useEffect(() => {
    setupPlayer();
    return () => handleCleanup();
  }, []);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentPositionSec(0);
    setCurrentDurationSec(0);
    handleCleanup();
  }, [audioUrl, postId]);

  const setupPlayer = async () => {
    try {
      await audioRecorderPlayer.setSubscriptionDuration(0.1);
    } catch (error) {
      console.error('Error setting up player:', error);
    }
  };

  const handleCleanup = async () => {
    try {
      if (isPlaying) {
        await audioRecorderPlayer.stopPlayer();
        audioRecorderPlayer.removePlayBackListener();
        setIsPlaying(false);
        onPlayStateChange(false);
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  };

  const onPlayPause = async () => {
    try {
      setIsLoading(true);
      
      if (isPlaying) {
        await audioRecorderPlayer.pausePlayer();
        setIsPlaying(false);
        onPlayStateChange(false);
      } else {
        if (currentPositionSec === 0) {
          await audioRecorderPlayer.startPlayer(audioUrl);
          audioRecorderPlayer.addPlayBackListener((e) => {
            if (e.currentPosition === e.duration) {
              stopPlaying();
              return;
            }
            setCurrentPositionSec(e.currentPosition);
            setCurrentDurationSec(e.duration);
          });
        } else {
          await audioRecorderPlayer.resumePlayer();
        }
        setIsPlaying(true);
        onPlayStateChange(true);
      }
    } catch (error) {
      console.error('Failed to toggle play state:', error);
      Alert.alert('Error', 'Failed to play audio');
      setIsPlaying(false);
      onPlayStateChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const stopPlaying = async () => {
    try {
      await audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
      setIsPlaying(false);
      setCurrentPositionSec(0);
      onPlayStateChange(false);
    } catch (error) {
      console.error('Failed to stop playing:', error);
    }
  };

  // Handle seeking directly by tapping on the seekbar
  const handleSeekTap = async (event) => {
    if (currentDurationSec === 0) return;
    
    try {
      const { locationX } = event.nativeEvent;
      const progressBarWidth = styles.progressBarContainer.width;
      const seekPosition = (locationX / progressBarWidth) * currentDurationSec;
      
      await audioRecorderPlayer.seekToPlayer(seekPosition);
      setCurrentPositionSec(seekPosition);
    } catch (error) {
      console.error('Failed to seek:', error);
    }
  };

  // Only show mm:ss, no microseconds or tenths
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  // PostCard specific audio player
  if (inPostCard) {
    return (
      <View style={styles.postCardPlayerContainer}>
        <TouchableOpacity 
          style={styles.postCardPlayButton}
          onPress={onPlayPause}
          disabled={isLoading}
        >
          <Icon 
            name={isPlaying ? "pause" : "play"} 
            size={16} 
            color="#fff" 
          />
        </TouchableOpacity>
        
        <View style={styles.postCardPlayerContent}>
          <TouchableOpacity 
            style={styles.postCardProgressBarContainer}
            onPress={handleSeekTap}
          >
            <Animated.View 
              style={[
                styles.postCardProgressBar,
                {
                  width: progressWidth.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]} 
            />
          </TouchableOpacity>
          
          <Text style={styles.postCardTimeText}>
            {formatTime(currentPositionSec)} / {formatTime(currentDurationSec || 0)}
          </Text>
        </View>
      </View>
    );
  }

  // Render compact version of the player for PostCard
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <TouchableOpacity 
          style={styles.compactPlayButton}
          onPress={onPlayPause}
          disabled={isLoading}
        >
          <Icon 
            name={isPlaying ? "pause" : "play"} 
            size={16} 
            color="#B45309" 
          />
        </TouchableOpacity>
        
        <View style={styles.compactProgressContainer}>
          <Text style={styles.compactTimeText}>
            {formatTime(currentPositionSec)} / {formatTime(currentDurationSec || 0)}
          </Text>
          
          <TouchableOpacity 
            style={styles.compactProgressBarContainer}
            onPress={handleSeekTap}
          >
            <Animated.View 
              style={[
                styles.compactProgressBar,
                {
                  width: progressWidth.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]} 
            />
          </TouchableOpacity>
        </View>
        
        {hasMultipleTracks && (
          <View style={styles.compactTrackControls}>
            <TouchableOpacity
              disabled={!onPreviousTrack || currentTrackNumber <= 1}
              onPress={onPreviousTrack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <FontAwesome
                name="step-backward"
                size={10}
                color="#B45309"
                style={{ opacity: currentTrackNumber <= 1 ? 0.5 : 1 }}
              />
            </TouchableOpacity>
            <Text style={styles.compactTrackText}>{currentTrackNumber}/{totalTracks}</Text>
            <TouchableOpacity
              disabled={!onNextTrack || currentTrackNumber >= totalTracks}
              onPress={onNextTrack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <FontAwesome
                name="step-forward"
                size={10}
                color="#B45309"
                style={{ opacity: currentTrackNumber >= totalTracks ? 0.5 : 1 }}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // Original full-sized player
  return (
    <View style={styles.container}>
      <View style={styles.playerContent}>
        {hasMultipleTracks && (
          <View style={styles.trackInfoContainer}>
            <Text style={styles.trackInfoText}>
              {currentTrackNumber}/{totalTracks}
            </Text>
          </View>
        )}
        
        <View style={styles.controlsRow}>
          <View style={styles.controls}>
            {hasMultipleTracks && (
              <TouchableOpacity
                style={styles.trackNavButton}
                onPress={onPreviousTrack}
                disabled={!onPreviousTrack || currentTrackNumber <= 1}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <FontAwesome
                  name="step-backward"
                  size={12}
                  color="white"
                  style={{ opacity: currentTrackNumber <= 1 ? 0.5 : 1 }}
                />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.playButton, isLoading && styles.buttonDisabled]}
              onPress={onPlayPause}
              disabled={isLoading}
            >
              <Icon 
                name={isPlaying ? "pause" : "play"} 
                size={20} 
                color="white" 
              />
            </TouchableOpacity>
            
            {hasMultipleTracks && (
              <TouchableOpacity
                style={styles.trackNavButton}
                onPress={onNextTrack}
                disabled={!onNextTrack || currentTrackNumber >= totalTracks}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <FontAwesome
                  name="step-forward"
                  size={12}
                  color="white"
                  style={{ opacity: currentTrackNumber >= totalTracks ? 0.5 : 1 }}
                />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.timeText}>
            {formatTime(currentPositionSec)}/{formatTime(currentDurationSec)}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.progressBarContainer}
          onPress={handleSeekTap}
        >
          <Animated.View 
            style={[
              styles.progressBar,
              {
                width: progressWidth.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // PostCard player specific styles
  postCardPlayerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B45309',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  postCardPlayButton: {
    width: 30,
    height: 30, 
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  postCardPlayerContent: {
    flex: 1,
  },
  postCardProgressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 4,
  },
  postCardProgressBar: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  postCardTimeText: {
    color: 'white',
    fontSize: 10,
  },

  // Original styles
  container: {
    backgroundColor: '#B45309',
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
  },
  playerContent: {
    width: '100%',
  },
  trackInfoContainer: {
    alignItems: 'center',
    marginBottom: 4,
  },
  trackInfoText: {
    color: 'white',
    fontSize: 12,
    opacity: 0.8,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackNavButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  audioLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  timeText: {
    color: 'white',
    fontSize: 12,
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  
  // Compact styles for PostCard integration
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 4,
    paddingHorizontal: 0,
    marginTop: 4,
  },
  compactPlayButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  compactProgressContainer: {
    flex: 1,
  },
  compactTimeText: {
    color: '#8B4F17',
    fontSize: 10,
    marginBottom: 2,
  },
  compactProgressBarContainer: {
    height: 3,
    backgroundColor: 'rgba(180, 83, 9, 0.2)',
    borderRadius: 1.5,
    overflow: 'hidden',
    width: '100%',
  },
  compactProgressBar: {
    height: '100%',
    backgroundColor: '#B45309',
    borderRadius: 1.5,
  },
  compactTrackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    gap: 5,
  },
  compactTrackText: {
    fontSize: 10,
    color: '#8B4F17',
  },
});

export default AudioPlayer;