const express = require('express');

const router = express.Router();
const GITGUB_SHA = process.env.GITGUB_SHA || 'undefined';

router.get('/healthcheck', (req, res) => {
  res.status(200).json({
    GITGUB_SHA,
  });
});

module.exports = router;
