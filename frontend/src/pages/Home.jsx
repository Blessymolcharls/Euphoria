import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdMusicNote, MdAutoAwesome } from 'react-icons/md';
import { SiSpotify } from 'react-icons/si';
import api from '../api/client';
import styles from './Home.module.css';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/parse-playlist', { url: url.trim() });
      navigate(`/playlist/${res.data.playlistId}`, { state: res.data });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to parse playlist. Check your Spotify URL.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Floating particles */}
      <div className={styles.particles}>
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className={styles.particle}
            animate={{ y: [-20, 20, -20], x: [-10, 10, -10] }}
            transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
            style={{ left: `${8 + i * 8}%`, top: `${15 + (i % 5) * 16}%`, opacity: 0.15 + (i % 3) * 0.07 }}
          />
        ))}
      </div>

      <motion.div
        className={styles.hero}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        {/* Badge */}
        <motion.div
          className={styles.badge}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <MdAutoAwesome size={14} />
          <span>Spotify • YouTube • Offline</span>
        </motion.div>

        <h1 className={styles.headline}>
          Your playlists,<br />
          <span className="gradient-text">offline forever.</span>
        </h1>
        <p className={styles.sub}>
          Paste a Spotify playlist link. We extract the tracks, find the best audio match on YouTube, and download them to your library.
        </p>

        {/* Input form */}
        <motion.form
          className={styles.form}
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className={styles.inputWrapper}>
            <SiSpotify className={styles.spotifyIcon} size={22} color="#1db954" />
            <input
              id="playlist-url"
              className={styles.input}
              type="url"
              placeholder="https://open.spotify.com/playlist/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          <button
            id="parse-btn"
            className="btn-primary"
            type="submit"
            disabled={loading}
          >
            {loading ? <><span className="spinner" />Parsing...</> : <><MdMusicNote size={18} />Parse Playlist</>}
          </button>
        </motion.form>

        {error && (
          <motion.p
            className={styles.error}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}

        {/* Feature pills */}
        <motion.div
          className={styles.features}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {['Spotify metadata', 'Smart YouTube matching', 'MP3 downloads', 'Built-in player'].map((f) => (
            <span key={f} className={styles.pill}>{f}</span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
