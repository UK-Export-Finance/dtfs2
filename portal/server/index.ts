import { fixAzureEnvironmentVariables } from './azure-env';
import app from './createApp';
fixAzureEnvironmentVariables();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.info('✅ Portal UI micro-service initialised on :%s', PORT));
