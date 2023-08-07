require('./azure-env');
const app = require('./generateApp');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.info('✅ Portal UI micro-service initialised on :%s', PORT));
