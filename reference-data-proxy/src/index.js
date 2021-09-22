const app = require('./createApp');

const PORT = process.env.PORT || 5000;

console.log(`GITHUB_SHA: ${process.env.GITHUB_SHA}`);
app.listen(PORT, () => console.log(`Reference Data Proxy listening on port ${PORT}`)); // eslint-disable-line no-console
