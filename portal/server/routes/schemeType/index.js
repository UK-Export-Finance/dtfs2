const express = require('express');
const { validateToken, validateRole } = require('../middleware');
const { getSchemeType, postSchemeType } = require('../../controllers/schemeType');

const router = express.Router();
router.use('/select-scheme', validateToken);
router.get('/select-scheme', validateRole({ role: ['maker', 'checker'] }), getSchemeType);
router.post('/select-scheme', validateRole({ role: ['maker'] }), postSchemeType);

module.exports = router;
