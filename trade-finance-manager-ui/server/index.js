const app = require('./createApp');

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => console.info('✅ TFM UI micro-service initialised on :%s', PORT));
