import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MdLibraryMusic, MdPlayCircle } from 'react-icons/md';
import api from '../api/client';
import { usePlayer } from '../context/PlayerContext';
import TrackCard from '../components/TrackCard/TrackCard';
import styles from './Library.module.css';

export default function Library() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
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
      <motion.h1
        className={styles.heading}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Your <span className="gradient-text">Library</span>
      </motion.h1>

      {playlists.map((pl, pIndex) => (
        <motion.section
          key={pl._id}
          className={`glass-card ${styles.playlistSection}`}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: pIndex * 0.1 }}
        >
          {/* Playlist header */}
          <div className={styles.plHeader}>
            <div className={styles.plInfo}>
              {pl.coverArt && (
                <img src={pl.coverArt} alt={pl.name} className={styles.plCover} />
              )}
              <div>
                <h2 className={styles.plName}>{pl.name}</h2>
                <p className={styles.plCount}>{pl.trackCount} tracks</p>
              </div>
            </div>
            <button
              className="btn-primary"
              onClick={() => playTrack(pl.tracks, 0)}
              id={`play-${pl._id}`}
            >
              <MdPlayCircle size={20} /> Play All
            </button>
          </div>

          {/* Tracks */}
          <div className={styles.tracks}>
            {pl.tracks.map((track, i) => (
              <TrackCard
                key={track._id}
                track={track}
                index={i}
                allTracks={pl.tracks}
                onDownload={() => {}}
              />
            ))}
          </div>
        </motion.section>
      ))}
    </div>
  );
}
