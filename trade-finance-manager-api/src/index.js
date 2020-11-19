const app = require('./createApp');

const PORT = process.env.PORT || 5200;

console.log(`GITHUB_SHA: ${process.env.GITHUB_SHA}`);
app.listen(PORT, () => console.log(`Trade Finance Manager API listening on port ${PORT}`)); // eslint-disable-line no-console
