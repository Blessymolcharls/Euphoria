import fetch from 'isomorphic-unfetch';

async function debugSession() {
  const res = await fetch('https://open.spotify.com/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  const sessionMatch = html.match(/<script id="session" data-testid="session" type="application\/json">(.+?)<\/script>/s);
  if (sessionMatch) {
    console.log('Session JSON:', sessionMatch[1].substring(0, 500));
    const session = JSON.parse(sessionMatch[1]);
    console.log('Access token:', session.accessToken ? session.accessToken.substring(0, 10) + '...' : 'none');
  } else {
    console.log('No session script found. Hunting for other tokens...');
    const tokenMatch = html.match(/accessToken["']?\s*:\s*["']([^"']+)["']/i);
    if (tokenMatch) {
      console.log('Found token elsewhere:', tokenMatch[1].substring(0, 10));
    } else {
      console.log('No token found.');
    }
  }
}
debugSession();
