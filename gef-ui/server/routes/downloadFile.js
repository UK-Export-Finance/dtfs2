const express = require('express');
const { validateRole, validateToken } = require('../middleware');
const downloadFile = require('../controllers/downloadFile');
const { MAKER, CHECKER } = require('../constants/roles');

const router = express.Router();

router.get('/file/:fileId', [validateToken, validateRole({ role: [MAKER, CHECKER] })], (req, res) => downloadFile(req, res));

module.exports = router;
