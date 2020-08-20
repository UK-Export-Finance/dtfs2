const express = require('express');

const healthcheck = express.Router();
const GITHUB_SHA = process.env.GITHUB_SHA || 'undefined';

healthcheck.get('/healthcheck', (req, res) => {
  res.status(200).json({
    GITHUB_SHA,
  });
});

export default healthcheck;
