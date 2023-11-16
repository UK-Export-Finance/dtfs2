import dotenv from 'dotenv';
import fixAzureEnvironmentVariables from './azure-env';
import app from './createApp';

dotenv.config();
fixAzureEnvironmentVariables();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.info('✅ Portal API micro-service initialised on :%s', PORT));
