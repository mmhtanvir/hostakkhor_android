import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import Icon from 'react-native-vector-icons/FontAwesome';
import RNFS from 'react-native-fs';

interface AudioRecorderProps {
  onRecordingComplete: (uri: string) => void;
  onCancel: () => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  onCancel,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState('00:00');
  const [playTime, setPlayTime] = useState('00:00');
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer());

  useEffect(() => {
    return () => {
      stopRecording();
      stopPlaying();
    };
  }, []);

  const startRecording = async () => {
    try {
      const path = Platform.select({
        ios: `recording_${Date.now()}.m4a`,
        android: `${RNFS.CachesDirectoryPath}/recording_${Date.now()}.m4a`,
      });

      await audioRecorderPlayer.current.startRecorder(path);
      audioRecorderPlayer.current.addRecordBackListener((e) => {
        setRecordingTime(audioRecorderPlayer.current.mmssss(Math.floor(e.currentPosition)));
      });
      setIsRecording(true);
    } catch (error) {
      console.error('Recording error:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!isRecording) return;

    try {
      const result = await audioRecorderPlayer.current.stopRecorder();
      audioRecorderPlayer.current.removeRecordBackListener();
      setIsRecording(false);
      setRecordedUri(result);
    } catch (error) {
      console.error('Stop recording error:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const startPlaying = async () => {
    if (!recordedUri) return;

    try {
      await audioRecorderPlayer.current.startPlayer(recordedUri);
      audioRecorderPlayer.current.addPlayBackListener((e) => {
        if (e.currentPosition === e.duration) {
          stopPlaying();
        } else {
          setPlayTime(audioRecorderPlayer.current.mmssss(Math.floor(e.currentPosition)));
        }
      });
      setIsPlaying(true);
    } catch (error) {
      console.error('Playback error:', error);
      Alert.alert('Error', 'Failed to play recording');
    }
  };

  const stopPlaying = async () => {
    if (!isPlaying) return;

    try {
      await audioRecorderPlayer.current.stopPlayer();
      audioRecorderPlayer.current.removePlayBackListener();
      setIsPlaying(false);
      setPlayTime('00:00');
    } catch (error) {
      console.error('Stop playing error:', error);
    }
  };

  const handleSave = () => {
    if (recordedUri) {
      onRecordingComplete(recordedUri);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Record Audio</Text>
        <TouchableOpacity onPress={onCancel}>
          <Icon name="times" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {!recordedUri ? (
          <>
            <View style={styles.recordingStatus}>
              {isRecording && (
                <>
                  <View style={styles.recordingIndicator} />
                  <Text style={styles.recordingTime}>{recordingTime}</Text>
                </>
              )}
            </View>

            <TouchableOpacity
              style={[styles.recordButton, isRecording && styles.recordingActive]}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <Icon
                name={isRecording ? "stop" : "microphone"}
                size={24}
                color={isRecording ? "#FFF" : "#666"}
              />
              <Text style={[styles.buttonText, isRecording && styles.recordingText]}>
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.playButton}
              onPress={isPlaying ? stopPlaying : startPlaying}
            >
              <Icon
                name={isPlaying ? "pause" : "play"}
                size={24}
                color="#666"
              />
              <Text style={styles.playTime}>{isPlaying ? playTime : recordingTime}</Text>
            </TouchableOpacity>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
              >
                <Icon name="check" size={20} color="#FFF" />
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.retryButton]}
                onPress={() => {
                  setRecordedUri(null);
                  setRecordingTime('00:00');
                }}
              >
                <Icon name="redo" size={20} color="#666" />
                <Text style={styles.retryButtonText}>Record Again</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    alignItems: 'center',
  },
  recordingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    marginBottom: 16,
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF4444',
    marginRight: 8,
  },
  recordingTime: {
    fontSize: 16,
    color: '#FF4444',
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
  },
  recordingActive: {
    backgroundColor: '#FF4444',
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  recordingText: {
    color: '#FFF',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
  },
  playTime: {
    marginLeft: 16,
    fontSize: 16,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: '#1a73e8',
  },
  retryButton: {
    backgroundColor: '#F5F5F5',
  },
  saveButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#FFF',
    fontWeight: '500',
  },
  retryButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
});

export default AudioRecorder;