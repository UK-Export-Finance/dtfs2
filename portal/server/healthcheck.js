const express = require('express');

const healthcheck = express.Router();
const GITHUB_SHA = process.env.GITHUB_SHA || 'undefined';

healthcheck.get('/healthcheck', (req, res) => {
  const data = {
    commit_hash: GITHUB_SHA,
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
  };
  try {
    res.status(200).send(data);
  } catch (error) {
    data.message = error;
    res.status(503).send();
  }
});

module.exports = healthcheck;
