const express = require('express');
const {
  ROLES: { MAKER, CHECKER },
} = require('@ukef/dtfs2-common');
const { validateToken, validateRole } = require('../middleware');
const { getSchemeType, postSchemeType } = require('../../controllers/schemeType');

const router = express.Router();
router.use('/select-scheme', validateToken);
router.get('/select-scheme', [validateRole({ role: [MAKER, CHECKER] }), getSchemeType]);
router.post('/select-scheme', [validateRole({ role: [MAKER] }), postSchemeType]);

module.exports = router;
