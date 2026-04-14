import fetch from 'isomorphic-unfetch';

(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/export/69ce42f0b342d76ea176288f');
    console.log("Status:", res.status);
    console.log("Content-Disposition:", res.headers.get('content-disposition'));
    process.exit(0);
  } catch (err) {
    console.error("Test failed:", err);
  }
})();
