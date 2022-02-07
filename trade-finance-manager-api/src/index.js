require('./azure-env');

const app = require('./createApp');

const PORT = process.env.PORT || 5004;

app.listen(PORT, () => console.info(`Trade Finance Manager API listening on port ${PORT}`));
