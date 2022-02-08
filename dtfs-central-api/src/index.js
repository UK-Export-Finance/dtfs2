require('./azure-env');

const app = require('./createApp');

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => console.info(`Central API listening on port ${PORT}`));
