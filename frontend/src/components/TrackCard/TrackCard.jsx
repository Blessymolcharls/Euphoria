import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdDownload, MdPlayArrow, MdQueueMusic, MdClose } from 'react-icons/md';
import { usePlayer } from '../../context/PlayerContext';
import api from '../../api/client';
import styles from './TrackCard.module.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const STATUS_LABELS = {
  pending: 'Wait',
  searching: 'Sync',
  downloading: 'DL',
  done: 'Ready',
  error: 'Err',
};

const METRO_COLORS = [
  'var(--metro-blue)', 'var(--metro-purple)', 'var(--metro-teal)', 
  'var(--metro-pink)', 'var(--metro-orange)', 'var(--metro-green)', 'var(--metro-yellow)'
];

export default function TrackCard({ track, index, allTracks, onDownload, isExpanded, onToggleExpand }) {
  const { playTrack, addToQueue, currentTrack, isPlaying } = usePlayer();
  const [status, setStatus] = useState(track.status);
  const [anchor, setAnchor] = useState('center');
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (isExpanded && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const hw = window.innerWidth / 2;
      // 600px is expanded width. Required safe space is ~320px from center.
      if (rect.left + (rect.width/2) < 320) setAnchor('left');
      else if (window.innerWidth - (rect.right - rect.width/2) < 320) setAnchor('right');
      else setAnchor('center');
    }
  }, [isExpanded]);

  // Poll status while not done/error
  useEffect(() => {
    if (status === 'done' || status === 'error' || status === 'pending') return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/status/${track._id}`);
        setStatus(res.data.status);
        if (res.data.status === 'done' || res.data.status === 'error') {
          clearInterval(interval);
        }
      } catch {/* ignore */}
    }, 2000);
    return () => clearInterval(interval);
  }, [status, track._id]);

  useEffect(() => { setStatus(track.status); }, [track.status]);

  const isCurrentlyPlaying = currentTrack?._id === track._id && isPlaying;

  const handleTileClick = (e) => {
    if (e) e.stopPropagation();
    if (status !== 'done') return; // Cannot interact if not downloaded
    if (onToggleExpand) onToggleExpand(isExpanded ? null : track._id);
  };

  const handlePlayNow = (e) => {
    e.stopPropagation();
    if (onToggleExpand) onToggleExpand(null);
    playTrack(
      allTracks.filter((t) => t.status === 'done'), 
      allTracks.filter((t) => t.status === 'done').findIndex((t) => t._id === track._id)
    );
  };

  const handleQueue = (e) => {
    e.stopPropagation();
    if (onToggleExpand) onToggleExpand(null);
    addToQueue(track);
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    if (status !== 'pending' && status !== 'error') return;
    onDownload(track._id);
    setStatus('searching');
  };

  const mosaicHash = (index % 11);
  let tileClass = styles.tileNormal;
  if (mosaicHash === 0) tileClass = styles.tileLarge;
  else if (mosaicHash === 3 || mosaicHash === 7) tileClass = styles.tileWide;

  const tileColor = METRO_COLORS[index % METRO_COLORS.length];

  const anchorClass = 
    anchor === 'left' ? styles.expandedAnchorLeft :
    anchor === 'right' ? styles.expandedAnchorRight : 
    styles.expandedAnchorCenter;

  return (
    <div ref={wrapperRef} className={tileClass} style={{ position: 'relative' }}>
      <motion.div
        layout
        className={`${styles.card} ${isExpanded ? `${styles.expandedOverlayBase} ${anchorClass}` : styles.cardNormal} ${isCurrentlyPlaying ? styles.active : ''}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          delay: isExpanded ? 0 : (index % 20) * 0.02,
          type: 'tween', duration: 0.25, ease: 'easeOut',
          layout: { type: 'tween', duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }
        }}
        onClick={handleTileClick}
        style={{ backgroundColor: tileColor }}
      >
        {/* Background image — animated via framer-motion for smooth fade */}
        <motion.div
          className={styles.bgImage}
          animate={{
            opacity: isExpanded ? 0.12 : 1,
            filter: isExpanded ? 'grayscale(100%) blur(6px)' : 'grayscale(0%) blur(0px)'
          }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <img src={track.albumArt || '/placeholder.png'} alt={track.title} loading="lazy" />
        </motion.div>

        <AnimatePresence mode="wait" initial={false}>
          {!isExpanded ? (
            /* Minimalist tile state */
            <motion.div
              key="minimized"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
            >
              <div className={styles.simpleGradient} />
              <div className={styles.minimizedIndicator}>
                {status === 'done' && <div className={styles.dotDone} />}
                {(status === 'searching' || status === 'downloading') && <span className="spinner" style={{ width: 8, height: 8 }} />}
              </div>
              <div className={styles.simpleTitleOverlay}>{track.title}</div>
            </motion.div>
          ) : (
            /* Expanded detail state */
            <motion.div
              key="expanded"
              className={styles.expandedContent}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className={styles.expandedLeft}>
                <img src={track.albumArt || '/placeholder.png'} className={styles.expandedCover} alt={track.title} />
                <div className={styles.expandedTextOverlay}>
                  <div className={styles.expandedTitle}>{track.title}</div>
                  <div className={styles.expandedArtist}>{track.artist}</div>
                </div>
              </div>

              <div className={styles.expandedRight}>
                {status === 'done' ? (
                  <button className={styles.actionPill} onClick={handlePlayNow}>
                    <MdPlayArrow size={24} /> PLAY NOW
                  </button>
                ) : (status === 'pending' || status === 'error') ? (
                  <button className={styles.actionPill} onClick={handleDownload}>
                    <MdDownload size={24} /> {status === 'error' ? 'RETRY SYNC' : 'SYNC NOW'}
                  </button>
                ) : (
                  <button className={styles.actionPill} disabled style={{ opacity: 0.5 }}>
                    <span className="spinner" style={{ width: 16, height: 16, borderColor: 'var(--bg)', borderTopColor: 'transparent' }} /> SYNCING...
                  </button>
                )}

                <button className={`${styles.actionPill} ${styles.actionSecondary}`} onClick={handleQueue}>
                  <MdQueueMusic size={24} /> ADD TO QUEUE
                </button>
                <button className={`${styles.actionPill} ${styles.actionSecondary}`} onClick={(e) => { e.stopPropagation(); if (onToggleExpand) onToggleExpand(null); }}>
                  <MdClose size={24} /> CLOSE
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
