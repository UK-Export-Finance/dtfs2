const express = require('express');
const { validateToken, validateRole } = require('../middleware');
const { getSchemeType, postSchemeType } = require('../../controllers/schemeType');
const { MAKER } = require('../../constants/roles');

const router = express.Router();
router.use('/select-scheme*', [validateToken, validateRole({ role: [MAKER] })]);
router.get('/select-scheme', getSchemeType);
router.post('/select-scheme', postSchemeType);

module.exports = router;
