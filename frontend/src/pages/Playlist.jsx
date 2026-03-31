import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdDownload, MdArrowBack } from 'react-icons/md';
import api from '../api/client';
import TrackCard from '../components/TrackCard/TrackCard';
import styles from './Playlist.module.css';

export default function PlaylistPage() {
  const { playlistId } = useParams();
  const { state: locationState } = useLocation();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(locationState || null);
  const [tracks, setTracks] = useState(locationState?.tracks || []);
  const [loading, setLoading] = useState(!locationState);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!locationState) {
      api.get(`/tracks/${playlistId}`).then((res) => {
        setPlaylist(res.data.playlist);
        setTracks(res.data.tracks);
      }).finally(() => setLoading(false));
    }
  }, [playlistId]);

  const downloadAll = async () => {
    setDownloading(true);
    try {
      await api.post('/download', { playlistId });
      // Refresh tracks list after a short delay
      setTimeout(async () => {
        const res = await api.get(`/tracks/${playlistId}`);
        setTracks(res.data.tracks);
        setDownloading(false);
      }, 1000);
    } catch {
      setDownloading(false);
    }
  };

  const downloadSingle = async (trackId) => {
    await api.post('/download', { playlistId, trackIds: [trackId] });
    setTracks((prev) =>
      prev.map((t) => (t._id === trackId ? { ...t, status: 'searching' } : t))
    );
  };

  const doneCount = tracks.filter((t) => t.status === 'done').length;
  const pendingCount = tracks.filter((t) => t.status === 'pending').length;

  if (loading) {
    return (
      <div className={styles.center}>
        <span className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button className="btn-ghost" onClick={() => navigate('/')}>
          <MdArrowBack size={18} /> Back
        </button>

        <div className={styles.playlistInfo}>
          {playlist?.coverArt && (
            <img src={playlist.coverArt} alt={playlist.name} className={styles.cover} />
          )}
          <div>
            <p className={styles.ownerLabel}>Playlist by {playlist?.owner}</p>
            <h1 className={styles.playlistName}>{playlist?.name}</h1>
            <p className={styles.stats}>
              {tracks.length} tracks &nbsp;·&nbsp;
              <span style={{ color: 'var(--success)' }}>{doneCount} downloaded</span>
            </p>
          </div>
        </div>

        {pendingCount > 0 && (
          <button
            className="btn-primary"
            onClick={downloadAll}
            disabled={downloading}
            id="download-all-btn"
          >
            {downloading ? (
              <><span className="spinner" />Queuing...</>
            ) : (
              <><MdDownload size={18} />Download All ({pendingCount})</>
            )}
          </button>
        )}
      </motion.div>

      {/* Progress bar */}
      {doneCount > 0 && (
        <div className={styles.progressBar}>
          <motion.div
            className={styles.progressFill}
            initial={{ width: 0 }}
            animate={{ width: `${(doneCount / tracks.length) * 100}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
      )}

      {/* Track list */}
      <div className={styles.trackList}>
        {tracks.map((track, i) => (
          <TrackCard
            key={track._id}
            track={track}
            index={i}
            allTracks={tracks}
            onDownload={downloadSingle}
          />
        ))}
      </div>
    </div>
  );
}
