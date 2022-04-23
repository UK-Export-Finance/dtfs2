const express = require('express');
const { getApplicationSubmission, postApplicationSubmission } = require('../controllers/application-submission');
const { validateRole, validateToken, validateBank } = require('../middleware');

const router = express.Router();

router.get('/application-details/:dealId/submit', [validateToken, validateBank, validateRole({ role: ['maker'] })], getApplicationSubmission);
router.post('/application-details/:dealId/submit', [validateToken, validateBank, validateRole({ role: ['maker'] })], postApplicationSubmission);

module.exports = router;
