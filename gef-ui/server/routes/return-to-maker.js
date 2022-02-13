const express = require('express');
const { getReturnToMaker, postReturnToMaker } = require('../controllers/return-to-maker');
const { validateRole, validateToken } = require('../middleware');

const router = express.Router();

router.get('/application-details/:dealId/return-to-maker', [validateToken, validateRole.validate({ role: ['checker'] })], getReturnToMaker);
router.post('/application-details/:dealId/return-to-maker', [validateToken, validateRole.validate({ role: ['checker'] })], postReturnToMaker);

module.exports = router;
