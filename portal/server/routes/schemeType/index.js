const express = require('express');
const { validateToken, validateRole } = require('../middleware');
const { getSchemeType, postSchemeType } = require('../../controllers/schemeType');
const { MAKER, CHECKER } = require('../../constants/roles');

const router = express.Router();
router.use('/select-scheme', validateToken);
router.get('/select-scheme', validateRole({ role: [MAKER, CHECKER] }), getSchemeType);
router.post('/select-scheme', validateRole({ role: [MAKER] }), postSchemeType);

module.exports = router;
