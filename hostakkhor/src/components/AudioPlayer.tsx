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

interface AudioPlayerProps {
  audioUrl: string;
  index: number;
  postId: string;
  isScreenFocused: boolean;
  currentlyPlaying: boolean;
  onPlayStateChange: (isPlaying: boolean) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  index,
  postId,
  isScreenFocused,
  currentlyPlaying,
  onPlayStateChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPositionSec, setCurrentPositionSec] = useState(0);
  const [currentDurationSec, setCurrentDurationSec] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const progressWidth = useRef(new Animated.Value(0)).current;
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;

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
          console.log('Starting playback for:', audioUrl);
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

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.playerContent}>
        <View style={styles.controlsRow}>
          <View style={styles.controls}>
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
            
            <Text style={styles.audioLabel}>
              Audio {index + 1}
            </Text>
          </View>

          <Text style={styles.timeText}>
            {formatTime(currentPositionSec)}/{formatTime(currentDurationSec)}
          </Text>
        </View>

        <View style={styles.progressBarContainer}>
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
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#B45309',
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
  },
  playerContent: {
    width: '100%',
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
});

export default AudioPlayer;