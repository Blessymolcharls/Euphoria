# Euphoria 🎵

> **Spotify Playlist → Offline Audio Library**

Paste a Spotify playlist link. Euphoria extracts track metadata via the Spotify Web API, finds the best match on YouTube, downloads the audio via yt-dlp, and gives you a beautiful offline player.

---

## Prerequisites

| Tool | Purpose |
|------|---------|
| Node.js 18+ | Backend + Frontend |
| MongoDB | Track/playlist storage |
| Redis | BullMQ job queue |
| [yt-dlp](https://github.com/yt-dlp/yt-dlp#installation) | Audio downloader |
| [ffmpeg](https://ffmpeg.org/download.html) | Audio conversion |

### Install yt-dlp (Windows)
```sh
winget install yt-dlp
# OR
pip install yt-dlp
```

### Install ffmpeg (Windows)
```sh
winget install Gyan.FFmpeg
```

### Run Redis (Docker)
```sh
docker run -d -p 6379:6379 redis
```

---

## API Keys Required

1. **Spotify**: [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) → Create App → Get Client ID & Secret
2. **YouTube Data API v3**: [console.cloud.google.com](https://console.cloud.google.com) → Enable YouTube Data API v3 → Create API key
3. **MongoDB**: Your existing MongoDB Atlas URI or local MongoDB

---

## Setup

### Backend
```sh
cd euphoria/backend
npm install
cp .env.example .env
# Fill in your keys in .env
npm run dev          # Start API server on :5000
# In another terminal:
npm run worker       # Start download worker
```

### Frontend
```sh
cd euphoria/frontend
npm install
npm run dev          # Start React app on :5173
```

---

## Architecture

```
Frontend (React + Vite)  :5173
   ↓ HTTP (Axios)
Backend (Express)  :5000
   ├─ Spotify Web API   → metadata only
   ├─ YouTube Data API  → search + scoring
   ├─ BullMQ + Redis    → async download queue
   ├─ yt-dlp            → MP3 download
   └─ MongoDB           → track/playlist storage
```

---

## Usage

1. Open `http://localhost:5173`
2. Paste a Spotify playlist URL
3. Click **Parse Playlist** → track list appears
4. Click **Download All** → background queue starts
5. Watch status badges update in real time
6. Head to **Library** → play downloaded tracks

---

## Legal Note

This app uses Spotify metadata only (no Spotify audio). Audio is sourced from YouTube for **personal/educational use**. Do not redistribute downloaded content.
