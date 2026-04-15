import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PlayerProvider } from './context/PlayerContext';
import Navbar from './components/Navbar/Navbar';
import AudioPlayer from './components/AudioPlayer/AudioPlayer';
import Home from './pages/Home';
import PlaylistPage from './pages/Playlist';
import Library from './pages/Library';
import About from './pages/About';
import DotTypography from './pages/DotTypography';

export default function App() {
  return (
    <PlayerProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/playlist/:playlistId" element={<PlaylistPage />} />
          <Route path="/library" element={<Library />} />
          <Route path="/about" element={<About />} />
          <Route path="/typography" element={<DotTypography />} />
        </Routes>
        <AudioPlayer />
      </BrowserRouter>
    </PlayerProvider>
  );
}
