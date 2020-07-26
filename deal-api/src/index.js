const app = require('./createApp');

// Fix Azure environment variables
Object.keys(process.env).forEach((key) => {
  if (key.startsWith('CUSTOMCONNSTR_')) {
    const fixedKey = key.substr('CUSTOMCONNSTR_'.length);
    process.env[fixedKey] = process.env[key];
    console.log(`Fixed ${key} to ${fixedKey}`);
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Deals API listening on port ${PORT}`)); // eslint-disable-line no-console
