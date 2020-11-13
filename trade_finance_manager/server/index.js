'use strict';

const express = require('express');

// Constants

const PORT = process.env.PORT || 5100;
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(PORT, () => console.log(`TFM-UI app listening on port ${PORT}!`)); // eslint-disable-line no-console

