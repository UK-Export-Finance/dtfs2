const express = require('express');

const healthcheck = express.Router();
const GITHUB_SHA = process.env.GITHUB_SHA || 'undefined';

healthcheck.get('/healthcheck', async (req, res) => {
  const data = {
    uptime: process.uptime(),
    message: 'Ok',
    date: new Date(),
    ui: {
      commitHash: GITHUB_SHA,
    },
  };

  try {
    res.status(200).send(data);
  } catch (e) {
    data.message = e;
    res.status(503).send();
  }
});

module.exports = healthcheck;
