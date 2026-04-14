import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdPlayArrow, MdPause, MdSkipNext, MdSkipPrevious,
  MdVolumeUp, MdVolumeOff, MdKeyboardArrowDown,
  MdShuffle, MdRepeat, MdVolumeDown, MdNotes
} from 'react-icons/md';
import { usePlayer } from '../../context/PlayerContext';
import LyricsView from './LyricsView';
import { DotIconPlay, DotIconPause, DotIconPrevious, DotIconNext } from './DotIcons';
import styles from './AudioPlayer.module.css';

const formatTime = (s) => {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

export default function AudioPlayer() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
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
      <div className={styles.playerWrapper}>
        <motion.div
          layout
          className={isExpanded ? styles.fullPlayer : styles.miniPlayer}
          onClick={() => !isExpanded && setIsExpanded(true)}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', bounce: 0.25, duration: 0.6 }}
        >
          {/* Dynamic Blurred Background matching the PixelPlayer "Material You" immersive vibe */}
          {isExpanded && (
            <motion.div 
              className={styles.dynamicBackground}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 1 }}
            >
              <img src={currentTrack.albumArt || '/placeholder.png'} alt=""/>
            </motion.div>
          )}

          <audio
            ref={audioRef}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={next}
          />

          {!isExpanded ? (
            // =========================
            // MINI PLAYER (Collapsed)
            // =========================
            <>
              <div className={styles.artContainerMini}>
                <img src={currentTrack.albumArt || '/placeholder.png'} alt="Album Art" />
              </div>
              <div className={styles.infoMini}>
                <motion.span layoutId="title" className={styles.titleMini}>{currentTrack.title}</motion.span>
                <motion.span layoutId="artist" className={styles.artistMini}>{currentTrack.artist}</motion.span>
              </div>
              <div className={styles.miniControls}>
                <button 
                  className={styles.playPillMini} 
                  onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                  style={{ background: 'transparent', border: 'none', color: '#fff' }}
                >
                  {isPlaying ? <DotIconPause size={28} /> : <DotIconPlay size={28} />}
                </button>
                <button 
                  className={styles.iconBtn} 
                  onClick={(e) => { e.stopPropagation(); next(); }} 
                  style={{ width: '40px', height: '40px' }}
                >
                  <DotIconNext size={28} />
                </button>
              </div>
            </>
          ) : (
            // =========================
            // FULL PLAYER (Expanded Sheet)
            // =========================
            <div className={styles.contentWrapper}>
              <div className={styles.header}>
                <button className={styles.collapseBtn} onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}>
                  <MdKeyboardArrowDown size={28} />
                </button>
                <span className={styles.nowPlayingText}>Now Playing</span>
                <div style={{width: 40}}></div>{/* Spacer for center alignment */}
              </div>

              <motion.div 
                key="art"
                className={`${styles.artContainerFull} ${showLyrics ? styles.hideOnMobile : ''}`} 
                layoutId="albumArtContainer"
                onClick={() => setShowLyrics(!showLyrics)}
                style={{ cursor: 'pointer' }}
                title="Toggle full screen lyrics"
              >
                <img src={currentTrack.albumArt || '/placeholder.png'} alt="Album Art" />
              </motion.div>

              <AnimatePresence mode="popLayout">
                {showLyrics ? (
                  <motion.div 
                    key="lyrics"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className={styles.lyricsFullContainer}
                  >
                    <LyricsView title={currentTrack.title} artist={currentTrack.artist} progress={progress} albumArt={currentTrack.albumArt} />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="info"
                    className={styles.infoFull}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.h2 layoutId="title" className={styles.titleFull}>{currentTrack.title}</motion.h2>
                    <motion.p layoutId="artist" className={styles.artistFull}>{currentTrack.artist}</motion.p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={styles.scrubberContainer}>
                <input
                  type="range"
                  className={styles.slider}
                  min={0}
                  max={duration || 0}
                  step={0.1}
                  value={progress}
                  onChange={(e) => seek(Number(e.target.value))}
                />
                <div className={styles.timeRow}>
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className={styles.fullControls}>
                <button className={styles.iconBtn}><MdShuffle size={28} /></button>
                <button className={styles.iconBtn} onClick={prev}><DotIconPrevious size={36} color="#fff" /></button>
                <button 
                  onClick={togglePlay}
                  style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px' }}
                >
                  {isPlaying ? <DotIconPause size={44} /> : <DotIconPlay size={44} />}
                </button>
                <button className={styles.iconBtn} onClick={next}><DotIconNext size={36} color="#fff" /></button>
                <button className={styles.iconBtn}><MdRepeat size={28} /></button>
              </div>

              <div className={styles.extraControls}>
                <button 
                  onClick={() => setShowLyrics(!showLyrics)} 
                  style={{background:'none', border:'none', color: showLyrics ? 'var(--accent)' : 'inherit', cursor:'pointer', display:'flex', alignItems:'center'}}
                  title="Toggle Lyrics"
                >
                  <MdNotes size={26} />
                </button>
                <div className={styles.volumeContainer}>
                  <button onClick={() => changeVolume(volume > 0 ? 0 : 0.8)} style={{background:'none', border:'none', color:'inherit', cursor:'pointer', display:'flex', alignItems:'center'}}>
                    {volume === 0 ? <MdVolumeOff size={22} /> : <MdVolumeDown size={22} />}
                  </button>
                  <input
                    type="range"
                    className={styles.volumeSlider}
                    min={0} max={1} step={0.02}
                    value={volume}
                    onChange={(e) => changeVolume(Number(e.target.value))}
                  />
                  <MdVolumeUp size={22} />
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
