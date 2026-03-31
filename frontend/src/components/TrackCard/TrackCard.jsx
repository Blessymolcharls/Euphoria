import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdDownload, MdCheckCircle, MdError, MdPlayArrow } from 'react-icons/md';
import { usePlayer } from '../../context/PlayerContext';
import api from '../../api/client';
import styles from './TrackCard.module.css';

const STATUS_LABELS = {
  pending: 'Pending',
  searching: 'Searching...',
  downloading: 'Downloading...',
  done: 'Ready',
  error: 'Error',
};

export default function TrackCard({ track, index, allTracks, onDownload }) {
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const [status, setStatus] = useState(track.status);

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

  // Sync status from parent if it changes
  useEffect(() => { setStatus(track.status); }, [track.status]);

  const isCurrentlyPlaying =
    currentTrack?._id === track._id && isPlaying;

  const handlePlay = () => {
    if (status !== 'done') return;
    playTrack(allTracks.filter((t) => t.status === 'done'), 
      allTracks.filter((t) => t.status === 'done').findIndex((t) => t._id === track._id));
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    if (status !== 'pending') return;
    onDownload(track._id);
    setStatus('searching');
  };

  return (
    <motion.div
      className={`${styles.card} ${status === 'done' ? styles.clickable : ''} ${isCurrentlyPlaying ? styles.active : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      onClick={handlePlay}
    >
      <div className={styles.index}>
        {isCurrentlyPlaying ? (
          <span className={styles.playingDot}><span className="pulse-dot" /></span>
        ) : (
          <span className={styles.num}>{index + 1}</span>
        )}
      </div>

      <img
        src={track.albumArt || '/placeholder.png'}
        alt={track.title}
        className={styles.art}
      />

      <div className={styles.info}>
        <span className={styles.title}>{track.title}</span>
        <span className={styles.artist}>{track.artist}</span>
        {track.album && <span className={styles.album}>{track.album}</span>}
      </div>

      <div className={styles.right}>
        <span className={`badge badge-${status}`}>
          {status === 'searching' || status === 'downloading'
            ? <span className="spinner" style={{ width: 10, height: 10 }} />
            : null}
          {STATUS_LABELS[status]}
        </span>

        {status === 'pending' && (
          <button className={styles.actionBtn} onClick={handleDownload} title="Download">
            <MdDownload size={18} />
          </button>
        )}
        {status === 'done' && (
          <button className={styles.actionBtn} onClick={handlePlay} title="Play">
            <MdPlayArrow size={18} />
          </button>
        )}
        {status === 'error' && (
          <MdError size={18} style={{ color: 'var(--error)' }} />
        )}
      </div>
    </motion.div>
  );
}
