import dotenv from 'dotenv';
import fixAzureEnvironmentVariables from './azure-env/index.ts';

dotenv.config();
fixAzureEnvironmentVariables();

import initScheduler from './scheduler';

initScheduler();

import app from './createApp';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.info('✅ Portal API micro-service initialised on :%s', PORT));
