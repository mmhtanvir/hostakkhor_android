import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Sound from 'react-native-sound';

interface AudioPlayerProps {
  audioUrl: string;
}

const AudioPlayer = ({ audioUrl }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState<Sound | null>(null);

  useEffect(() => {
    // Enable playback in silence mode
    Sound.setCategory('Playback');

    // Initialize the sound
    const newSound = new Sound(audioUrl, '', (error) => {
      setLoading(false);
      if (error) {
        console.log('Error loading sound:', error);
        return;
      }
      setDuration(newSound.getDuration());
      setSound(newSound);
    });

    return () => {
      if (sound) {
        sound.release();
      }
    };
  }, [audioUrl]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const playPause = () => {
    if (!sound) return;

    if (isPlaying) {
      sound.pause(() => {
        setIsPlaying(false);
      });
    } else {
      sound.play((success) => {
        if (!success) {
          console.log('Playback failed');
        }
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (sound && isPlaying) {
      const interval = setInterval(() => {
        sound.getCurrentTime((seconds) => {
          setCurrentTime(seconds);
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [sound, isPlaying]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={playPause} style={styles.playButton}>
        <Icon name={isPlaying ? 'pause' : 'play'} size={20} color="#fff" />
      </TouchableOpacity>
      
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
        <Text style={styles.timeText}> / {formatTime(duration)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    marginLeft: 16,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
});

export default AudioPlayer;