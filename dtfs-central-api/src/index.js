require('./azure-env');
const { createApp } = require('../src/createApp');

const app = createApp();

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => console.info('✅ Central micro-service initialised on :%s', PORT));
