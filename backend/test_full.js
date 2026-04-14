import fetch from 'isomorphic-unfetch';

const playlistId = '7FOCgikpjJLYPQfmMhY35c';

async function testWebPlayerScraping() {
  console.log('Fetching main web player page...');
  const res = await fetch(`https://open.spotify.com/playlist/${playlistId}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
    }
  });
  
  const text = await res.text();
  
  // Look for clientId or accessToken inside session data
  const sessionMatch = text.match(/<script id="session" data-testid="session" type="application\/json">(.+?)<\/script>/);
  if (!sessionMatch) {
    console.log('No session script found. Looking for other tokens...');
    const backupMatch = text.match(/"accessToken":"([^"]+)"/);
    if (backupMatch) {
       console.log('Found token:', backupMatch[1].substring(0, 30) + '...');
       await testToken(backupMatch[1]);
    } else {
       console.log('Failed to find token.');
    }
    return;
  }
  
  const session = JSON.parse(sessionMatch[1]);
  console.log('Extracted session:', session.accessToken ? 'Has Token' : 'No Token');
  await testToken(session.accessToken);
}

async function testToken(token) {
  console.log('Trying token on API...');
  const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=0&limit=100`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  console.log('Status:', res.status);
  const data = await res.json();
  if (data.error) {
     console.error('API Error:', data.error.message);
  } else {
     console.log('Success! Tracks returned:', data.items?.length);
     console.log('Total tracks on playlist:', data.total);
  }
}

testWebPlayerScraping();
