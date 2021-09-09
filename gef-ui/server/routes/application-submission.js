const express = require('express');
const {
  getApplicationSubmission,
  postApplicationSubmission,
} = require('../controllers/application-submission');
const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.get('/application-details/:applicationId/submit', validateToken, getApplicationSubmission);
router.post('/application-details/:applicationId/submit', validateToken, postApplicationSubmission);

module.exports = router;
