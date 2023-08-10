require('./azure-env');
const app = require('./createApp');

const PORT = process.env.PORT || 5006;

app.listen(PORT, () => console.info('✅ GEF UI micro-service initialised on :%s', PORT));
