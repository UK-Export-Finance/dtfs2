import fixAzureEnvironmentVariables from './azure-env/index.ts';

import app from './createApp';

fixAzureEnvironmentVariables();

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => console.info('✅ Central micro-service initialised on :%s', PORT));
