const express = require('express');
const { validateRole, validateToken } = require('../middleware');
const downloadFile = require('../controllers/downloadFile');

const router = express.Router();

router.get(
  '/file/:fileId',
  [validateToken, validateRole({ role: ['maker', 'checker'] })],
  (req, res) => downloadFile(req, res),
);

module.exports = router;
