import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdPlayArrow, MdPause, MdSkipNext, MdSkipPrevious,
  MdVolumeUp, MdVolumeOff,
} from 'react-icons/md';
import { usePlayer } from '../../context/PlayerContext';
import styles from './AudioPlayer.module.css';

const formatTime = (s) => {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

export default function AudioPlayer() {
  const {
    currentTrack, isPlaying, progress, duration, volume,
    audioRef, togglePlay, next, prev, seek, changeVolume,
    setProgress, setDuration, setIsPlaying,
  } = usePlayer();

  // Rebuild audio src when track changes
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    audioRef.current.src = `${apiBase}/stream/${currentTrack._id}`;
    audioRef.current.volume = volume;
    audioRef.current.play().catch(() => {});
    setIsPlaying(true);
  }, [currentTrack?._id]);

  const handleTimeUpdate = () => {
    if (audioRef.current) setProgress(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  if (!currentTrack) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={styles.player}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Hidden HTML5 audio element */}
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={next}
        />

        {/* Track info */}
        <div className={styles.trackInfo}>
          <img
            src={currentTrack.albumArt || '/placeholder.png'}
            alt={currentTrack.title}
            className={styles.albumArt}
          />
          <div className={styles.meta}>
            <span className={styles.title}>{currentTrack.title}</span>
            <span className={styles.artist}>{currentTrack.artist}</span>
          </div>
        </div>

        {/* Controls + seek */}
        <div className={styles.center}>
          <div className={styles.controls}>
            <button className={styles.ctrl} onClick={prev} title="Previous">
              <MdSkipPrevious size={24} />
            </button>
            <button className={styles.playBtn} onClick={togglePlay}>
              {isPlaying ? <MdPause size={28} /> : <MdPlayArrow size={28} />}
            </button>
            <button className={styles.ctrl} onClick={next} title="Next">
              <MdSkipNext size={24} />
            </button>
          </div>
          <div className={styles.seekRow}>
            <span className={styles.time}>{formatTime(progress)}</span>
            <input
              type="range"
              className={styles.seekBar}
              min={0}
              max={duration || 0}
              value={progress}
              onChange={(e) => seek(Number(e.target.value))}
            />
            <span className={styles.time}>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume */}
        <div className={styles.volumeArea}>
          <button
            className={styles.ctrl}
            onClick={() => changeVolume(volume > 0 ? 0 : 0.8)}
          >
            {volume === 0 ? <MdVolumeOff size={20} /> : <MdVolumeUp size={20} />}
          </button>
          <input
            type="range"
            className={styles.volumeBar}
            min={0} max={1} step={0.02}
            value={volume}
            onChange={(e) => changeVolume(Number(e.target.value))}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
