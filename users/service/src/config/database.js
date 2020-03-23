require('dotenv').config();

const mongoose = require('mongoose');

const devConnection = process.env.MONGODB_URI;

mongoose.connect(devConnection, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('Database connected'); // eslint-disable-line no-console
});
