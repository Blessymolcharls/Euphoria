import fetch from 'isomorphic-unfetch';

const getAnonToken = async () => {
    try {
        const res = await fetch('https://open.spotify.com/get_access_token?reason=transport&productType=web_player');
        const data = await res.json();
        console.log("Token:", data.accessToken.substring(0, 30) + "...");
        
        // Let's try to fetch the playlist
        const pRes = await fetch('https://api.spotify.com/v1/playlists/6TVBfAyDMbEWGh0d922E2q', {
            headers: { 'Authorization': `Bearer ${data.accessToken}` }
        });
        const pData = await pRes.json();
        console.log("Playlist name:", pData.name);
        console.log("Tracks:", pData.tracks.items.length);
    } catch (err) {
        console.error(err);
    }
}
getAnonToken();
