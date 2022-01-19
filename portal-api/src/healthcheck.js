const express = require('express');

const router = express.Router();
const GITHUB_SHA = process.env.GITHUB_SHA || 'undefined';

router.get('/healthcheck', (req, res) => {
  res.status(200).json({
    commit_hash: GITHUB_SHA,
  });
});

module.exports = router;
