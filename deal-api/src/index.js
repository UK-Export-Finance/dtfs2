const PORT = process.env.PORT || 5000;

const app = require('./createApp');

app.listen(PORT, () => console.log(`Deals API listening on port ${PORT}`));
