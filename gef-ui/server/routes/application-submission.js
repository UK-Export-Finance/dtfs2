const express = require('express');
const { getApplicationSubmission, postApplicationSubmission } = require('../controllers/application-submission');
const { validateRole, validateToken, validateBank } = require('../middleware');
const { MAKER } = require('../constants/roles');

const router = express.Router();

router.get('/application-details/:dealId/submit', [validateToken, validateBank, validateRole({ role: [MAKER] })], getApplicationSubmission);
router.post('/application-details/:dealId/submit', [validateToken, validateBank, validateRole({ role: [MAKER] })], postApplicationSubmission);

module.exports = router;
