import fixAxureEnvironmentVariables from './azure-env'
import app from './createApp';
fixAxureEnvironmentVariables();

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => console.info('✅ Central micro-service initialised on :%s', PORT));
