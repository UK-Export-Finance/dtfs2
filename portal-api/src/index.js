const dotenv = require('dotenv');

dotenv.config();
require('./azure-env');

const initScheduler = require('./scheduler');

initScheduler();

const app = require('./createApp');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.info('✅ Portal API micro-service initialised on :%s', PORT));
