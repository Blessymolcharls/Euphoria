import { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, LayoutGroup } from 'framer-motion';
import { MdDownload, MdArrowBack, MdRefresh, MdDelete } from 'react-icons/md';
import api from '../api/client';
import TrackCard from '../components/TrackCard/TrackCard';
import styles from './Playlist.module.css';

const ACTIVE_STATUSES = new Set(['searching', 'downloading']);

export default function PlaylistPage() {
  const { playlistId } = useParams();
  const { state: locationState } = useLocation();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(locationState || null);
  const [tracks, setTracks] = useState(locationState?.tracks || []);
  const [loading, setLoading] = useState(!locationState);
  const [downloading, setDownloading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  // Polling ref so we can clear it on unmount
  const pollRef = useRef(null);

  // ─── Fetch helpers ──────────────────────────────────────────
  const fetchTracks = async () => {
    try {
      const res = await api.get(`/tracks/${playlistId}`);
      setPlaylist(res.data.playlist);
      setTracks(res.data.tracks);
      return res.data.tracks;
    } catch {
      return null;
    }
  };

  // ─── Initial load ───────────────────────────────────────────
  useEffect(() => {
    if (!locationState) {
      fetchTracks().finally(() => setLoading(false));
    }
    return () => stopPolling();
  }, [playlistId]);

  // ─── Polling ─────────────────────────────────────────────────
  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  /**
   * Poll every 3 seconds. Auto-stops once no track is in an active state.
   */
  const startPolling = () => {
    if (pollRef.current) return; // already polling
    pollRef.current = setInterval(async () => {
      const latest = await fetchTracks();
      if (!latest) return;
      const hasActive = latest.some((t) => ACTIVE_STATUSES.has(t.status));
      if (!hasActive) {
        stopPolling();
        setDownloading(false);
      }
    }, 3000);
  };

  // ─── Delete Playlist ─────────────────────────────────────────
  const deletePlaylist = async () => {
    const confirmed = window.confirm(
      `Delete "${playlist?.name || 'this playlist'}"?\n\nThis will permanently remove the playlist and all its tracks from your library.`
    );
    if (!confirmed) return;
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiBase}/playlists/${playlistId}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      console.log('[DELETE]', res.status, data);
      if (res.ok) {
        navigate('/library');
      } else {
        alert(`Delete failed (${res.status}): ${data.error || 'Unknown error'}`);
      }
    } catch (e) {
      console.error('Failed to delete playlist', e);
      alert('Network error: ' + e.message);
    }
  };

  // ─── Download All ────────────────────────────────────────────
  const downloadAll = async () => {
    setDownloading(true);
    try {
      await api.post('/download', { playlistId });
      startPolling();
    } catch {
      setDownloading(false);
    }
  };

  // ─── Download Single ─────────────────────────────────────────
  const downloadSingle = async (trackId) => {
    await api.post('/download', { playlistId, trackIds: [trackId] });
    setTracks((prev) =>
      prev.map((t) => (t._id === trackId ? { ...t, status: 'searching' } : t))
    );
    startPolling();
  };

  // ─── Export to Folder ────────────────────────────────────────
  const exportToFolder = async () => {
    try {
      const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });

      setExporting(true);
      setExportProgress(0);

      const readyTracks = tracks.filter((t) => t.status === 'done');
      let count = 0;

      for (const track of readyTracks) {
        try {
          const safeName = (track.fileName || `${track.title} - ${track.artist}.mp3`)
            .replace(/[\\/:*?"<>|]/g, '');
          const fileHandle = await dirHandle.getFileHandle(safeName, { create: true });
          const writable = await fileHandle.createWritable();

          const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
          const res = await fetch(`${apiBase}/download-file/${track._id}`);
          if (res.ok) {
            await res.body.pipeTo(writable);
          } else {
            await writable.close();
          }
        } catch (e) {
          console.error('Failed to save', track.title, e);
        }

        count++;
        setExportProgress(Math.round((count / readyTracks.length) * 100));
      }

      // Clear backend cache after export
      await api.delete(`/export/${playlistId}/cache`);
      const refreshed = await fetchTracks();
      setExporting(false);
      setExportProgress(0);
      alert(`Export complete! ${count} track${count !== 1 ? 's' : ''} saved to your folder.`);
    } catch (e) {
      if (e?.name !== 'AbortError') console.error(e);
      setExporting(false);
      setExportProgress(0);
    }
  };

  // ─── Derived counts ──────────────────────────────────────────
  const doneCount    = tracks.filter((t) => t.status === 'done').length;
  const pendingCount = tracks.filter((t) => t.status === 'pending' || t.status === 'error').length;
  const activeCount  = tracks.filter((t) => ACTIVE_STATUSES.has(t.status)).length;

  // ─── Render ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.center}>
        <span className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
      </div>
    );
  }

  return (
    <div className={styles.page} onClick={() => setExpandedId(null)}>
      {/* Header */}
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="btn-ghost"
          onClick={() => navigate('/')}
          style={{ fontSize: '0.65rem', padding: '4px 10px', letterSpacing: '0.1em' }}
        >
          <MdArrowBack size={12} /> Back
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
              {activeCount > 0 && (
                <span style={{ color: 'var(--accent)', marginLeft: 8 }}>
                  · {activeCount} in progress
                </span>
              )}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Refresh button */}
          <button
            className="btn-ghost"
            onClick={fetchTracks}
            title="Refresh track statuses"
            style={{ padding: '8px 12px' }}
          >
            <MdRefresh size={16} />
          </button>

          {/* Delete playlist button */}
          <button
            className="btn-ghost"
            onClick={deletePlaylist}
            title="Delete this playlist"
            style={{ padding: '8px 12px', color: '#ff0b22', borderColor: 'rgba(255,11,34,0.3)' }}
          >
            <MdDelete size={16} />
          </button>

          {/* Download All / Queuing */}
          {(pendingCount > 0 || activeCount > 0) && (
            <button
              className="btn-primary"
              onClick={downloadAll}
              disabled={downloading || exporting || activeCount > 0}
              id="download-all-btn"
            >
              {downloading || activeCount > 0 ? (
                <><span className="spinner" />
                  {activeCount > 0 ? `${activeCount} downloading...` : 'Queuing...'}</>
              ) : (
                <><MdDownload size={18} />Download All ({pendingCount})</>
              )}
            </button>
          )}

          {/* Save to Folder */}
          {doneCount > 0 && (
            <button
              onClick={exportToFolder}
              className="btn-primary"
              disabled={exporting}
              style={{
                backgroundColor: exporting ? 'var(--bg-lighter)' : 'var(--success)',
                whiteSpace: 'nowrap',
              }}
            >
              {exporting ? (
                <>{exportProgress}% Exporting...</>
              ) : (
                <><MdDownload size={18} />Save to Folder ({doneCount})</>
              )}
            </button>
          )}
        </div>
      </motion.div>

      {/* Nothing OS Dotted Download Progress Bar */}
      {(downloading || activeCount > 0) && tracks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{
            padding: '20px 32px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Dot track */}
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {Array.from({ length: 40 }).map((_, i) => {
              const pct = doneCount / tracks.length;
              const filled = i / 40 < pct;
              const isActive = Math.abs(i / 40 - pct) < 0.03;
              return (
                <div key={i} style={{ position: 'relative', width: '8px', height: '8px' }}>
                  {/* Base dim dot */}
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: filled ? '#ffffff' : 'rgba(255,255,255,0.12)',
                    transition: 'background 0.3s'
                  }} />
                  {/* Pulse on active edge dot */}
                  {isActive && (
                    <motion.div
                      animate={{ scale: [1, 1.8, 1], opacity: [1, 0, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      style={{
                        position: 'absolute', inset: 0,
                        borderRadius: '50%',
                        background: '#ffffff',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Status text row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'steps(3)' }}
              style={{
                fontFamily: 'var(--font-dot)',
                fontSize: '0.75rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#ffffff',
                fontWeight: 700,
              }}
            >
              FETCHING SONGS
            </motion.span>

            <span style={{
              fontFamily: 'var(--font-dot)',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.4)',
            }}>
              {doneCount} / {tracks.length}
            </span>

            <span style={{
              fontFamily: 'var(--font-dot)',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.4)',
            }}>
              {activeCount > 0 ? `· ${activeCount} ACTIVE` : ''}
            </span>

            {/* Pulsing squares */}
            <div style={{ display: 'flex', gap: '5px', marginLeft: 'auto' }}>
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.15, 1, 0.15] }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.25 }}
                  style={{ width: '5px', height: '5px', background: '#ffffff' }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Track list */}
      <LayoutGroup id={`playlist-${playlistId}`}>
        <motion.div layout className={styles.trackList}>
          {tracks
            .filter(t => t.title?.toLowerCase().includes(searchQuery.toLowerCase()) || t.artist?.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((track, i) => (
            <TrackCard
              key={track._id}
              track={track}
              index={i}
              allTracks={tracks}
              onDownload={downloadSingle}
              isExpanded={expandedId === track._id}
              onToggleExpand={(id) => setExpandedId(id)}
            />
          ))}
        </motion.div>
      </LayoutGroup>
    </div>
  );
}
