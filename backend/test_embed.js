import fetch from 'isomorphic-unfetch';

const res = await fetch('https://open.spotify.com/embed/playlist/6TVBfAyDMbEWG88uR7h6QA', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
  }
});
const html = await res.text();
const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
const data = JSON.parse(match[1]);
const state = data.props.pageProps.state;

// Print the complete state structure (top-level keys and nested keys)
console.log('state keys:', Object.keys(state));
const stateStr = JSON.stringify(state, null, 2);
// Look for accessToken in the state string
const tokenMatch = stateStr.match(/"accessToken"\s*:\s*"([^"]+)"/);
console.log('Found accessToken:', tokenMatch ? tokenMatch[1].substring(0, 30) + '...' : 'NOT FOUND');
// Check the token type too
const tokenTypeMatch = stateStr.match(/"tokenType"\s*:\s*"([^"]+)"/);
console.log('Token type:', tokenTypeMatch ? tokenTypeMatch[1] : 'NOT FOUND');
