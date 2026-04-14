import fetch from 'isomorphic-unfetch';

async function testWebPlayer() {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    'Sec-Ch-Ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'Spotify-App-Version': '1.2.49.317.g790b0744',
    'App-Platform': 'WebPlayer'
  };

  try {
     // 1. Hit homepage to get some cookies
     console.log('Hitting homepage for cookies...');
     const homeRes = await fetch('https://open.spotify.com/', { headers });
     const cookies = homeRes.headers.raw()['set-cookie'] || [];
     const cookieStr = cookies.map(c => c.split(';')[0]).join('; ');
     console.log('Cookies:', cookieStr);

     // 2. Get token
     console.log('\nGetting token...');
     const tokenHead = { ...headers, Cookie: cookieStr };
     const tokenRes = await fetch('https://open.spotify.com/get_access_token?reason=transport&productType=web_player', { headers: tokenHead });
     
     console.log('Token status:', tokenRes.status);
     const tokenText = await tokenRes.text();
     console.log('Response:', tokenText);
     
     if (tokenRes.status === 200) {
        const token = JSON.parse(tokenText).accessToken;
        
        // 3. Hit API
        console.log('\nHitting API...');
        const apiRes = await fetch('https://api.spotify.com/v1/playlists/7FOCgikpjJLYPQfmMhY35c/tracks?offset=100&limit=100', {
           headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('API Status:', apiRes.status);
        console.log('API Response:', await apiRes.json());
     }
  } catch (err) {
     console.log(err);
  }
}

testWebPlayer();
