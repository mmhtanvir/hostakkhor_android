import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import Icon from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

interface AudioPlayerProps {
  audioUrl: string;
  index: number;
  postId: string;
  currentlyPlayingPostId: string | null;
  playingTrackIndex: number;
  isScreenFocused: boolean;
  onPlayStateChange: (isPlaying: boolean) => void;
  totalTracks?: number;
  currentTrackNumber?: number;
  onPreviousTrack?: () => void;
  onNextTrack?: () => void;
  compact?: boolean;
  inPostCard?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  index,
  postId,
  currentlyPlayingPostId,
  playingTrackIndex,
  isScreenFocused,
  onPlayStateChange,
  totalTracks = 1,
  currentTrackNumber = 1,
  onPreviousTrack,
  onNextTrack,
  compact = false,
  inPostCard = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPositionSec, setCurrentPositionSec] = useState(0);
  const [currentDurationSec, setCurrentDurationSec] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const progressWidth = useRef(new Animated.Value(0)).current;
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;

  const hasMultipleTracks = totalTracks > 1;
  const isThisPlayerActive =
    postId === currentlyPlayingPostId && index === playingTrackIndex;

  // Stop audio if not the active player or screen loses focus
  useEffect(() => {
    if ((!isThisPlayerActive || !isScreenFocused) && isPlaying) {
      stopPlaying();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isThisPlayerActive, isScreenFocused]);

  // Reset state when track or post changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentPositionSec(0);
    setCurrentDurationSec(0);
    handleCleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl, postId]);

  useEffect(() => {
    setupPlayer();
    return () => handleCleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    Animated.timing(progressWidth, {
      toValue: (currentPositionSec / currentDurationSec) * 100 || 0,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [currentPositionSec, currentDurationSec]);

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
        // Always stop before starting (fixes "Player is already running" error)
        try {
          await audioRecorderPlayer.stopPlayer();
          audioRecorderPlayer.removePlayBackListener();
        } catch (stopErr) {
          // ignore
        }

        await audioRecorderPlayer.startPlayer(audioUrl);
        audioRecorderPlayer.addPlayBackListener((e) => {
          if (e.currentPosition === e.duration) {
            stopPlaying();
            return;
          }
          if (!isSeeking) {
            setCurrentPositionSec(e.currentPosition);
            setCurrentDurationSec(e.duration);
          }
        });

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

  const onSlidingStart = () => {
    setIsSeeking(true);
    setSeekValue(currentPositionSec);
  };

  const onSlidingComplete = async (value: number) => {
    try {
      await audioRecorderPlayer.seekToPlayer(value);
      setCurrentPositionSec(value);
    } catch (error) {
      console.error('Failed to seek:', error);
    } finally {
      setIsSeeking(false);
    }
  };

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
            name={isPlaying ? 'pause' : 'play'}
            size={16}
            color="#fff"
          />
        </TouchableOpacity>
        <View style={styles.postCardPlayerContent}>
          <Slider
            style={styles.postCardSlider}
            minimumValue={0}
            maximumValue={currentDurationSec}
            value={isSeeking ? seekValue : currentPositionSec}
            minimumTrackTintColor="#FFF"
            maximumTrackTintColor="rgba(255,255,255,0.2)"
            thumbTintColor="#FFF"
            onValueChange={setSeekValue}
            onSlidingStart={onSlidingStart}
            onSlidingComplete={onSlidingComplete}
            disabled={currentDurationSec === 0}
          />
          <Text style={styles.postCardTimeText}>
            {formatTime(isSeeking ? seekValue : currentPositionSec)} / {formatTime(currentDurationSec || 0)}
          </Text>
        </View>
      </View>
    );
  }

  // Compact version
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <TouchableOpacity
          style={styles.compactPlayButton}
          onPress={onPlayPause}
          disabled={isLoading}
        >
          <Icon
            name={isPlaying ? 'pause' : 'play'}
            size={16}
            color="#B45309"
          />
        </TouchableOpacity>
        <View style={styles.compactProgressContainer}>
          <Text style={styles.compactTimeText}>
            {formatTime(isSeeking ? seekValue : currentPositionSec)} / {formatTime(currentDurationSec || 0)}
          </Text>
          <Slider
            style={styles.compactSlider}
            minimumValue={0}
            maximumValue={currentDurationSec}
            value={isSeeking ? seekValue : currentPositionSec}
            minimumTrackTintColor="#B45309"
            maximumTrackTintColor="rgba(180,83,9,0.2)"
            thumbTintColor="#B45309"
            onValueChange={setSeekValue}
            onSlidingStart={onSlidingStart}
            onSlidingComplete={onSlidingComplete}
            disabled={currentDurationSec === 0}
          />
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

  // Full player
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
                name={isPlaying ? 'pause' : 'play'}
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
            {formatTime(isSeeking ? seekValue : currentPositionSec)}/{formatTime(currentDurationSec)}
          </Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={currentDurationSec}
          value={isSeeking ? seekValue : currentPositionSec}
          minimumTrackTintColor="#FFF"
          maximumTrackTintColor="rgba(255,255,255,0.2)"
          thumbTintColor="#FFF"
          onValueChange={setSeekValue}
          onSlidingStart={onSlidingStart}
          onSlidingComplete={onSlidingComplete}
          disabled={currentDurationSec === 0}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  postCardSlider: {
    width: '100%',
    height: 22,
    marginBottom: 4,
  },
  postCardTimeText: {
    color: 'white',
    fontSize: 10,
  },

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
  slider: {
    width: '100%',
    height: 26,
    marginTop: 2,
    marginBottom: 2,
  },

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
  compactSlider: {
    width: '100%',
    height: 18,
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