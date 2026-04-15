import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MdAutoAwesome, MdOfflineBolt, MdDevices, MdHighQuality } from 'react-icons/md';
import { SiSpotify } from 'react-icons/si';
import api from '../api/client';
import DotText from '../components/DotMatrix/DotText';
import DOT_PRESETS from '../components/DotMatrix/dotPresets';
import styles from './Home.module.css';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  const handleMouseMove = (e) => {
    const x = e.clientX;
    const y = e.clientY;
    const px = (x / window.innerWidth - 0.5) * 100; // -50 to 50
    const py = (y / window.innerHeight - 0.5) * 100;
    setMousePos({ x, y, px, py });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/parse-playlist', { url: url.trim() });
      navigate(`/playlist/${res.data.playlistId}`, { state: res.data });
    } catch (err) {
      const backendMsg = err.response?.data?.error || err.response?.data?.message;
      setError(backendMsg || 'Failed to connect to the server. Is the backend running?');
      setLoading(false);
    }
  };

  return (
    <div 
      className={styles.page} 
      onMouseMove={handleMouseMove}
      style={{ 
        '--mouse-x': `${mousePos.x}px`, 
        '--mouse-y': `${mousePos.y}px`,
        '--px': mousePos.px,
        '--py': mousePos.py
      }}
    >
      <div className={styles.background} />
      <div className={styles.interactiveGlow} />

      <AnimatePresence mode="wait">
        {!loading ? (
          <motion.div
            key="formState"
            className={styles.hero}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
          >
            <h1 className={styles.headline} aria-label="Redefining Local Music Streaming">
              <DotText
                text="REDEFINING LOCAL"
                {...DOT_PRESETS.hero}
                animated
                style={{ marginBottom: '10px' }}
              />
              <DotText
                text="MUSIC STREAMING"
                {...DOT_PRESETS.hero}
                animated
              />
            </h1>
            <p className={styles.sub}>
              Paste any public Spotify playlist. We parse it, fetch high-quality local MP3s natively, and serve it via an immersive dark matrix player.
            </p>

            <motion.form
              className={styles.form}
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className={styles.inputWrapper}>
                <SiSpotify className={styles.spotifyIcon} size={24} color="#1db954" />
                <input
                  id="playlist-url"
                  className={styles.input}
                  type="text"
                  placeholder="Paste Spotify Playlist URL..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  required
                />
              </div>
              <button id="parse-btn" className={styles.parseBtn} type="submit" disabled={loading}>
                Generate Tiles
              </button>
            </motion.form>

            {error && (
              <motion.p className={styles.error} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                {error}
              </motion.p>
            )}

            <motion.div
              className={styles.tileGrid}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className={styles.featureTile}>
                <SiSpotify size={24} color="#fff" />
                <DotText text="ANY PLAYLIST" {...DOT_PRESETS.small} animated={false} />
              </div>
              <div className={styles.featureTile}>
                <MdHighQuality size={28} color="#fff" />
                <DotText text="SMART HD" {...DOT_PRESETS.small} animated={false} />
              </div>
              <div className={styles.featureTile}>
                <MdOfflineBolt size={28} color="#fff" />
                <DotText text="LOCAL DL" {...DOT_PRESETS.small} animated={false} />
              </div>
              <div className={styles.featureTile}>
                <MdDevices size={26} color="#fff" />
                <DotText text="ZERO ADS" {...DOT_PRESETS.small} animated={false} />
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="loadingState"
            className={styles.hero}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.5 }}
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              minHeight: '400px',
              border: '1px solid rgba(255,255,255,0.08)',
              background: '#000000',
              gap: '32px'
            }}
          >
            {/* Dotted Progression Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    {/* Dim dot (track) */}
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.15)' }} />
                    {/* Active dot (animated) */}
                    <motion.div
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity, 
                        delay: i * 0.05,
                        ease: "linear"
                      }}
                      style={{ position: 'absolute', top: 0, left: 0, width: '6px', height: '6px', borderRadius: '50%', background: '#ffffff' }}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Glitching text */}
            <div style={{ position: 'relative', overflow: 'hidden' }}>
              <motion.h2
                animate={{ opacity: [1, 0.3, 1, 0.7, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "steps(5)" }}
                style={{ 
                  fontSize: '1.4rem',
                  letterSpacing: '0.2em', 
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  fontFamily: 'var(--font-dot)',
                  color: '#ffffff'
                }}
              >
                FETCHING SONGS
              </motion.h2>
              <motion.div
                animate={{ x: [-200, 200] }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(255,11,34,0.15), transparent)',
                  width: '60px',
                  pointerEvents: 'none',
                }}
              />
            </div>

            {/* Counter dots */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.3 }}
                  style={{ width: 6, height: 6, background: '#ffffff' }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
