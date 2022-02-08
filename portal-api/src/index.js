const dotenv = require('dotenv');

dotenv.config();
require('./azure-env');
const app = require('./createApp');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.info(`Portal API listening on port ${PORT}`));
