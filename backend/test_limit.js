import fetch from 'isomorphic-unfetch';
(async () => {
  const tokenRes = await fetch('https://open.spotify.com/embed/playlist/6TVBfAyDMbEWG88uR7h6QA');
  const html = await tokenRes.text();
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
  const data = JSON.parse(match[1]);
  const stateStr = JSON.stringify(data.props?.pageProps?.state || {});
  const tokenMatch = stateStr.match(/"accessToken"\s*:\s*"([^"]+)"/);
  const token = tokenMatch[1];
  
  console.log("Fetching offset 100...");
  const tracksRes = await fetch('https://api.spotify.com/v1/playlists/6TVBfAyDMbEWG88uR7h6QA/tracks?offset=100&limit=100', {
    headers: { Authorization: 'Bearer ' + token }
  });
  console.log('Status code:', tracksRes.status);
  const body = await tracksRes.json();
  console.log('Returned items count:', body.items?.length);
  console.log('Error content:', body.error);
})();
