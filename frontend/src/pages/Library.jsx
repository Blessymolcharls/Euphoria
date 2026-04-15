import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MdLibraryMusic, MdPlayCircle } from 'react-icons/md';
import api from '../api/client';
import { usePlayer } from '../context/PlayerContext';
import TrackCard from '../components/TrackCard/TrackCard';
import DotText from '../components/DotMatrix/DotText';
import DOT_PRESETS from '../components/DotMatrix/dotPresets';
import styles from './Library.module.css';

export default function Library() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const { playTrack } = usePlayer();

  useEffect(() => {
    api.get('/library').then((res) => {
      setPlaylists(res.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={styles.center}>
        <span className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
      </div>
    );
  }

  if (playlists.length === 0) {
    return (
      <div className={styles.center}>
        <div className={styles.empty}>
          <MdLibraryMusic size={64} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
          <h2>Your library is empty</h2>
          <p>Parse a Spotify playlist and download some tracks to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.heading}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        role="heading"
        aria-level="1"
        aria-label="Your Library"
      >
        <DotText
          text="YOUR LIBRARY"
          {...DOT_PRESETS.heading}
          animated
        />
      </motion.div>

      <div className={styles.playlistList}>
        {playlists.map((pl, pIndex) => (
          <motion.div
            key={pl._id}
            className={styles.playlistRow}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: pIndex * 0.05 }}
            onClick={() => window.location.href = `/playlist/${pl._id}`}
          >
            <div className={styles.plCoverContainer}>
              {pl.coverArt ? (
                <img src={pl.coverArt} alt={pl.name} className={styles.plCoverImage} />
              ) : (
                <div className={styles.plCoverPlaceholder}>
                  <MdLibraryMusic size={24} color="#555" />
                </div>
              )}
            </div>
            <div className={styles.plDetails}>
              <h3 className={styles.plTitle}>{pl.name}</h3>
              <p className={styles.plSubtitle}>Playlist • {pl.trackCount} songs</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
