import fetch from 'isomorphic-unfetch';
import * as cheerio from 'cheerio'; // need to install cheerio

const url = 'https://open.spotify.com/playlist/6TVBfAyDMbEWGh0d922E2q';

fetch(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
  }
})
  .then(res => res.text())
  .then(html => {
    // Spotify usually puts the entire React state into a script tag.
    // Let's print the first 1000 chars of any JSON we find.
    const match = html.match(/<script type="application\/json" id="initial-state">(.+?)<\/script>/);
    if (match) {
        const decoded = Buffer.from(match[1], 'base64').toString('utf8');
        console.log("Found initial-state JSON! Length:", decoded.length);
        console.log(decoded.substring(0, 500));
    } else {
        console.log("No initial-state found. HTML length:", html.length);
        // Look for track names in HTML metadata
        const titleMatch = html.match(/<title>(.+?)<\/title>/);
        console.log("Title:", titleMatch ? titleMatch[1] : 'none');
    }
  }).catch(console.error);
