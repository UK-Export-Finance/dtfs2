require('./azure-env');
const { createApp } = require('./createApp');

const app = createApp();
const PORT = process.env.PORT || 5006;

app.listen(PORT, () => console.info('✅ GEF UI micro-service initialised on :%s', PORT));
