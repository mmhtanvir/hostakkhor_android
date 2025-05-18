import React, { createContext, useContext, useRef, useState, ReactNode } from 'react';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

// 1. Context types
interface AudioContextType {
  play: (options: {
    audioUrl: string;
    postId: string;
    trackIndex: number;
    onProgress: (pos: number, dur: number) => void;
    onStop: () => void;
  }) => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  currentlyPlayingPostId: string | null;
  playingTrackIndex: number;
  isPlaying: boolean;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

// 2. Provider implementation
export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;
  const [currentlyPlayingPostId, setCurrentlyPlayingPostId] = useState<string | null>(null);
  const [playingTrackIndex, setPlayingTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const progressRef = useRef<((pos: number, dur: number) => void) | null>(null);
  const stopCallbackRef = useRef<(() => void) | null>(null);

  const stop = async () => {
    try {
      await audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
    } catch {}
    setIsPlaying(false);
    setCurrentlyPlayingPostId(null);
    progressRef.current = null;
    stopCallbackRef.current && stopCallbackRef.current();
    stopCallbackRef.current = null;
  };

  const play: AudioContextType['play'] = async ({
    audioUrl,
    postId,
    trackIndex,
    onProgress,
    onStop,
  }) => {
    // If something else is playing, stop it first
    await stop();

    try {
      await audioRecorderPlayer.startPlayer(audioUrl);
      setCurrentlyPlayingPostId(postId);
      setPlayingTrackIndex(trackIndex);
      setIsPlaying(true);
      progressRef.current = onProgress;
      stopCallbackRef.current = onStop;

      audioRecorderPlayer.addPlayBackListener((e) => {
        progressRef.current && progressRef.current(e.currentPosition, e.duration);
        if (e.currentPosition === e.duration) {
          stop();
        }
      });
    } catch (e) {
      setIsPlaying(false);
      setCurrentlyPlayingPostId(null);
      stopCallbackRef.current && stopCallbackRef.current();
      stopCallbackRef.current = null;
      throw e;
    }
  };

  const pause = async () => {
    await audioRecorderPlayer.pausePlayer();
    setIsPlaying(false);
  };

  return (
    <AudioContext.Provider
      value={{
        play,
        pause,
        stop,
        currentlyPlayingPostId,
        playingTrackIndex,
        isPlaying,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useAudio must be used inside AudioProvider');
  return ctx;
};