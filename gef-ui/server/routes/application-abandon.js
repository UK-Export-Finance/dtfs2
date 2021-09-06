const express = require('express');
const {
  confirmAbandonApplication,
  abandonApplication,
} = require('../controllers/application-abandon');
const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.get('/application-details/:applicationId/abandon', validateToken, confirmAbandonApplication);
router.post('/application-details/:applicationId/abandon', validateToken, abandonApplication);

module.exports = router;
