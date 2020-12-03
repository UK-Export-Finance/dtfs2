require('./azure-env');

const app = require('./createApp');

const PORT = process.env.PORT || 5000;

console.log(`GITHUB_SHA: ${process.env.GITHUB_SHA}`);
app.listen(PORT, () => console.log(`Deals API listening on port ${PORT}`)); // eslint-disable-line no-console
