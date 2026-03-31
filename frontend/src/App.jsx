import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PlayerProvider } from './context/PlayerContext';
import Navbar from './components/Navbar/Navbar';
import AudioPlayer from './components/AudioPlayer/AudioPlayer';
import Home from './pages/Home';
import PlaylistPage from './pages/Playlist';
import Library from './pages/Library';

export default function App() {
  return (
    <PlayerProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/playlist/:playlistId" element={<PlaylistPage />} />
          <Route path="/library" element={<Library />} />
        </Routes>
        <AudioPlayer />
      </BrowserRouter>
    </PlayerProvider>
  );
}
