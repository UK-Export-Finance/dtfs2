const app = require('./createApp');
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Deals API listening on port ${PORT}`));
