import fetch from 'isomorphic-unfetch';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function getItunesCover(title, artist) {
   let query = encodeURIComponent(`${title} ${artist}`);
   
   try {
     let res = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1`);
     let data = await res.json();
     if (data.results?.[0]?.artworkUrl100) return true;
     
     // retry just title if first fails
     query = encodeURIComponent(title);
     res = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1`);
     data = await res.json();
     if (data.results?.[0]?.artworkUrl100) return true;
     
   } catch (e) {
     console.log('Error:', e.message);
   }
   return false;
}

async function testLimits() {
   const songs = Array(20).fill({ t: 'Mood', a: '24kGoldn' });
   let successes = 0;
   
   // Parallel
   console.log('Testing Parallel:');
   await Promise.all(songs.map(async s => { if (await getItunesCover(s.t, s.a)) successes++; }));
   console.log('Parallel Success:', successes);
   
   successes = 0;
   console.log('Testing Sequential (100ms):');
   for (const s of songs) {
       if (await getItunesCover(s.t, s.a)) successes++;
       await sleep(100);
   }
   console.log('Sequential Success:', successes);
}
testLimits();
