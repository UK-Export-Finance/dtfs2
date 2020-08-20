const express = require('express');

const healthcheck = express.Router();
const GITGUB_SHA = process.env.GITGUB_SHA || 'undefined';

healthcheck.get('/healthcheck', (req, res) => {
  res.status(200).json({
    GITGUB_SHA,
  });
});

export default healthcheck;
