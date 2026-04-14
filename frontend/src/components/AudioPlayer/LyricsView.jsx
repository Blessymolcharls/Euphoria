import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import styles from './LyricsView.module.css';

export default function LyricsView({ title, artist, progress }) {
  const [lyrics, setLyrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!title || !artist) return;
    setLoading(true);
    setLyrics(null);
    
    // Fetch from LRCLIB
    const url = `https://lrclib.net/api/search?track_name=${encodeURIComponent(title)}&artist_name=${encodeURIComponent(artist)}`;
    
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0 && data[0].syncedLyrics) {
          const parsed = parseLrc(data[0].syncedLyrics);
          setLyrics(parsed);
        } else {
          setLyrics([]); // No lyrics found
        }
      })
      .catch((err) => {
        console.error("Lyrics fetch error:", err);
        setLyrics([]);
      })
      .finally(() => setLoading(false));
  }, [title, artist]);

  // Find active lyric line based on progress (in seconds)
  let activeIndex = -1;
  if (lyrics && lyrics.length) {
    for (let i = 0; i < lyrics.length; i++) {
      if (progress >= lyrics[i].time) {
        activeIndex = i;
      } else {
        break;
      }
    }
  }

  // Scroll active line into view
  useEffect(() => {
    if (activeIndex >= 0 && containerRef.current) {
      const activeEl = containerRef.current.querySelector(`.${styles.activeLine}`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeIndex]);

  if (loading) return <div className={styles.container}><span className="spinner" style={{width: 30, height: 30}} /></div>;
  if (!lyrics || lyrics.length === 0) return <div className={styles.container}><p className={styles.noLyrics}>Lyrics not available for this track.</p></div>;

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.paddingTop} />
      {lyrics.slice(Math.max(0, (activeIndex >= 0 ? activeIndex : 0) - 1), Math.max(0, (activeIndex >= 0 ? activeIndex : 0) - 1) + 3).map((line) => {
        const idx = lyrics.indexOf(line);
        const isActive = idx === activeIndex;
        const isPast = idx < activeIndex;
        
        let lineStyle = styles.line;
        if (isActive) lineStyle += ` ${styles.activeLine}`;
        else if (isPast) lineStyle += ` ${styles.pastLine}`;
        
        return (
          <motion.div 
            key={idx} 
            className={lineStyle}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isActive ? 1 : (isPast ? 0.3 : 0.5), y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={() => {
              // Could add seek to lyric logic here later if needed
            }}
          >
            {line.text}
          </motion.div>
        );
      })}
      <div className={styles.paddingBottom} />
    </div>
  );
}

function parseLrc(lrcText) {
  const lines = lrcText.split('\n');
  const result = [];
  const timeRegex = /\[(\d{2}):(\d{2}\.\d{2,3})\]/;

  lines.forEach(line => {
    const match = timeRegex.exec(line);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseFloat(match[2]);
      const timeInSeconds = minutes * 60 + seconds;
      const text = line.replace(timeRegex, '').trim();
      if (text) {
        result.push({ time: timeInSeconds, text });
      }
    }
  });

  return result;
}
