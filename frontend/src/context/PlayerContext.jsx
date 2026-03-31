import { createContext, useContext, useState, useRef, useCallback } from 'react';

const PlayerContext = createContext(null);

export const PlayerProvider = ({ children }) => {
  const [queue, setQueue] = useState([]);       // array of track objects
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);  // seconds
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef(null);

  const currentTrack = queue[currentIndex] || null;

  const playTrack = useCallback((tracks, startIndex = 0) => {
    setQueue(tracks);
    setCurrentIndex(startIndex);
    setIsPlaying(true);
    setProgress(0);
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying((p) => !p);
  };

  const next = () => {
    const ni = (currentIndex + 1) % queue.length;
    setCurrentIndex(ni);
    setProgress(0);
    setIsPlaying(true);
  };

  const prev = () => {
    if (progress > 3 && audioRef.current) {
      audioRef.current.currentTime = 0;
      setProgress(0);
      return;
    }
    const pi = (currentIndex - 1 + queue.length) % queue.length;
    setCurrentIndex(pi);
    setProgress(0);
    setIsPlaying(true);
  };

  const seek = (seconds) => {
    if (audioRef.current) audioRef.current.currentTime = seconds;
    setProgress(seconds);
  };

  const changeVolume = (v) => {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  return (
    <PlayerContext.Provider
      value={{
        queue,
        currentTrack,
        currentIndex,
        isPlaying,
        progress,
        duration,
        volume,
        audioRef,
        playTrack,
        togglePlay,
        next,
        prev,
        seek,
        changeVolume,
        setProgress,
        setDuration,
        setIsPlaying,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
