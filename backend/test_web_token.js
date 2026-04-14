import fetch from 'isomorphic-unfetch';

const run = async () => {
    try {
        const res = await fetch("https://open.spotify.com/get_access_token?reason=transport&productType=web_player", {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept': 'application/json',
                'Cookie': 'sp_dc=' // we might need a cookie, or maybe not
            }
        });
        const data = await res.json();
        console.log("Token:", data.accessToken ? "yes" : "no", data);
        
        if (!data.accessToken) return;

        const playlistId = '6TVBfAyDMbEWG88uR7h6QA';
        const tracksRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=100&limit=100`, {
            headers: { Authorization: `Bearer ${data.accessToken}` }
        });
        console.log("Tracks request offset=100 ok?", tracksRes.ok);
        if (!tracksRes.ok) {
            console.log("Tracks error:", await tracksRes.text());
        } else {
            const body = await tracksRes.json();
            console.log("Tracks fetched:", body.items?.length);
        }
    } catch(e) {
        console.error("Error", e);
    }
}
run();
