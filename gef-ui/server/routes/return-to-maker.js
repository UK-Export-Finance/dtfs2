const express = require('express');
const { getReturnToMaker, postReturnToMaker } = require('../controllers/return-to-maker');
const { validateRole, validateToken, validateBank } = require('../middleware');
const { CHECKER } = require('../constants/roles');

const router = express.Router();

router.get('/application-details/:dealId/return-to-maker', [validateToken, validateBank, validateRole({ role: [CHECKER] })], getReturnToMaker);
router.post('/application-details/:dealId/return-to-maker', [validateToken, validateBank, validateRole({ role: [CHECKER] })], postReturnToMaker);

module.exports = router;
