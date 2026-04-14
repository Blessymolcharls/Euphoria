import fetch from 'isomorphic-unfetch';

async function testItunes() {
   const res = await fetch('https://itunes.apple.com/search?term=Rap+God+Eminem&entity=song&limit=1');
   const data = await res.json();
   console.log('Artwork:', data.results[0]?.artworkUrl100);
}

testItunes();
