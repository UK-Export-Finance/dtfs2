const express = require('express');

const validateToken = require('../middleware/validate-token');
const isMaker = require('../middleware/isMaker');

const { getSchemeType, postSchemeType } = require('../../controllers/schemeType');

const router = express.Router();
router.use('/select-scheme/*', [validateToken, isMaker]);

router.get('/select-scheme', getSchemeType);

router.post('/select-scheme', postSchemeType);

module.exports = router;
