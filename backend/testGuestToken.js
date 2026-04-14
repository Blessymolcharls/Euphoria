import fetch from 'isomorphic-unfetch';

const playlistId = '7FOCgikpjJLYPQfmMhY35c';

async function testGuestToken() {
  try {
    console.log('Fetching anonymous guest token...');
    // Request a token from the web player's token endpoint
    const tokenRes = await fetch('https://open.spotify.com/get_access_token?reason=transport&productType=web_player', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });

    if (!tokenRes.ok) {
        throw new Error(`Token endpoint returned ${tokenRes.status}`);
    }

    const tokenData = await tokenRes.json();
    console.log('Token data:', {
      clientId: tokenData.clientId,
      isAnonymous: tokenData.isAnonymous,
      tokenPreview: tokenData.accessToken?.substring(0, 30) + '...'
    });

    if (!tokenData.accessToken) {
        console.error('Failed to get access token from Spotify');
        return;
    }

    // Try fetching the SECOND page of the playlist (songs 101 to 200)
    console.log('Fetching page 2 of tracks (offset 100)...');
    const apiRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=100&limit=100`, {
      headers: {
        'Authorization': `Bearer ${tokenData.accessToken}`,
        'Accept': 'application/json'
      }
    });

    const apiBody = await apiRes.text();
    console.log('API Status:', apiRes.status);
    
    if (apiRes.status === 200) {
        const parsed = JSON.parse(apiBody);
        console.log(`Success! Fetched ${parsed.items?.length || 0} tracks on page 2. Total playlist tracks: ${parsed.total}`);
    } else {
        console.log('Failed:', apiBody);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testGuestToken();
