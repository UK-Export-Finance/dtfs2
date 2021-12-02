const express = require('express');
const validateToken = require('../middleware/validateToken');
const downloadFile = require('../controllers/downloadFile');

const router = express.Router();

router.get('/file/:fileId', validateToken, downloadFile);

module.exports = router;
