import ytSearch from 'yt-search';

/**
 * Search YouTube for the best audio match for a given track using a free scraper (yt-search).
 * No API key required.
 * Scoring: title match + artist match + duration similarity.
 */
export const findBestYouTubeMatch = async (title, artist, durationMs) => {
  const query = `${title} ${artist} audio`;

  // Scrape YouTube search results (free, no API key needed)
  const response = await ytSearch(query);
  const items = response.videos || [];
  
  if (!items.length) return null;

  const scored = items.map((video) => {
    const vidTitle = video.title.toLowerCase();
    const vidChannel = video.author.name.toLowerCase();
    const vidDurationMs = video.duration.seconds * 1000;

    let score = 0;

    // Title match scoring
    const titleWords = title.toLowerCase().split(/\s+/);
    const artistWords = artist.toLowerCase().split(/\s+/);
    titleWords.forEach((w) => { if (vidTitle.includes(w)) score += 2; });
    artistWords.forEach((w) => {
      if (vidTitle.includes(w) || vidChannel.includes(w)) score += 2;
    });

    // Duration similarity scoring (within 10s = full points)
    if (durationMs && vidDurationMs) {
      const diff = Math.abs(durationMs - vidDurationMs);
      if (diff < 5000) score += 5;
      else if (diff < 15000) score += 3;
      else if (diff < 30000) score += 1;
    }

    // Penalize if "cover", "karaoke", "remix" etc. in title
    const penaltyWords = ['karaoke', 'cover', 'tutorial', 'reaction', 'lyrics only'];
    penaltyWords.forEach((w) => { if (vidTitle.includes(w)) score -= 4; });

    return {
      videoId: video.videoId,
      youtubeUrl: video.url,
      title: video.title,
      score,
    };
  });

  // Return top-N scoring results for fallback retries
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 5); // top 5 candidates
};
