require('./azure-env');
const dotenv = require('dotenv');
dotenv.config();

const app = require('./createApp');

const PORT = process.env.PORT || 5069;

app.listen(PORT, () => console.log(`test-hook-api listening on port ${PORT}`)); // eslint-disable-line no-console
