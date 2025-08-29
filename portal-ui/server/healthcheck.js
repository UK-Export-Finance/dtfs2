const express = require('express');

const healthcheck = express.Router();
const GITHUB_SHA = process.env.GITHUB_SHA || 'undefined';

healthcheck.get('/healthcheck', async (req, res) => {
  res.status(200).json({
    ui: {
      commit_hash: GITHUB_SHA,
    },
  });
});

module.exports = healthcheck;
