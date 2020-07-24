const app = require('./createApp');

// Fix Azure environment variables
Object.keys(process.env).forEach((key) => {
  process.env[key.substr('CUSTOMCONNSTR_'.length)] = process.env[key];
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Deals API listening on port ${PORT}`)); // eslint-disable-line no-console
