const express = require('express');

const router = express.Router();
const GITHUB_SHA = process.env.GITHUB_SHA || 'undefined';

async function pingMulesoft() {
  return 'Not configured';
}

router.get('/healthcheck', (req, res) => {
  const mulesoft = pingMulesoft();
  Promise.all([mulesoft]).then((values) => {
    res.status(200).json({
      commit_hash: GITHUB_SHA,
      mulesoft: values[0],
    });
  });
});

module.exports = router;
