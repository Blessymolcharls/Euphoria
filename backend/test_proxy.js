import fetch from 'isomorphic-unfetch';

try {
  const embedRes = await fetch('https://open.spotify.com/embed/playlist/6TVBfAyDMbEWG88uR7h6QA');
  const html = await embedRes.text();
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
  const token = JSON.parse(match[1]).props.pageProps.state.accessToken;
  
  console.log('Got Token:', token.substring(0, 10) + '...');
  
  const apiHeaders = { 
    'Authorization': 'Bearer ' + token,
    'Accept': 'application/json'
  };
  
  const targetUrl = 'https://api.spotify.com/v1/playlists/6TVBfAyDMbEWG88uR7h6QA?fields=name,description,owner,tracks.total';
  const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(targetUrl);
  
  console.log('Fetching', proxyUrl);
  const metaRes = await fetch(proxyUrl, { headers: apiHeaders });
  
  console.log('Status:', metaRes.status);
  console.log('Headers:', metaRes.headers.get('content-type'));
  const text = await metaRes.text();
  console.log('Result:', text.substring(0, 200));
} catch (e) {
  console.error(e);
}
