import fetch from 'isomorphic-unfetch';

(async () => {
  try {
    const tokenRes = await fetch('https://open.spotify.com/embed/playlist/6TVBfAyDMbEWG88uR7h6QA');
    const html = await tokenRes.text();
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s);
    const data = JSON.parse(match[1]);
    const stateStr = JSON.stringify(data.props?.pageProps?.state || {});
    const tokenMatch = stateStr.match(/"accessToken"\s*:\s*"([^"]+)"/);
    const token = tokenMatch[1];
    
    // GraphQL Query mapped to the Web Player's request structure
    // GraphQL Query mapped to the Web Player's request structure
    const query = encodeURIComponent(JSON.stringify({"uri":"spotify:playlist:6TVBfAyDMbEWG88uR7h6QA","offset":0,"limit":100}));
    const extensions = encodeURIComponent(JSON.stringify({"persistedQuery":{"version":1,"sha256Hash":"437ef09ffdfa863b92eb1af305e54ae88647acae"} })); // usually needs specific hash, testing fake/common
    
    // Note: If hash is wrong, Spotify might throw 400. Let's try an alternative open endpoint if this fails.
    const partnerRes = await fetch(`https://api-partner.spotify.com/pathfinder/v1/query?operationName=fetchPlaylist&variables=${query}&extensions=${extensions}`, {
      headers: { Authorization: 'Bearer ' + token }
    });
    
    console.log('Partner API Status:', partnerRes.status);
    console.log('Partner API Body:', (await partnerRes.text()).substring(0, 500));
  } catch(e) {
    console.error(e.message);
  }
})();
