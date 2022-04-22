const express = require('express');
const {
  getApplicationSubmission,
  postApplicationSubmission,
} = require('../controllers/application-submission');
const { validateRole, validateToken } = require('../middleware');

const router = express.Router();

router.get('/application-details/:dealId/submit', [validateToken, validateRole.validate({ role: ['maker'] })], getApplicationSubmission);
router.post('/application-details/:dealId/submit', [validateToken, validateRole.validate({ role: ['maker'] })], postApplicationSubmission);

module.exports = router;
