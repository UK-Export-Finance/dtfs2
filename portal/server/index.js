require('./azure-env');
const { createApp } = require('./createApp');

const app = createApp();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.info('✅ Portal UI micro-service initialised on :%s', PORT));
