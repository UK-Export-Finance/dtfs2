const express = require('express');
const {
  confirmAbandonApplication,
  abandonApplication,
} = require('../controllers/application-abandon');
const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.get('/application-details/:dealId/abandon', validateToken, confirmAbandonApplication);
router.post('/application-details/:dealId/abandon', validateToken, abandonApplication);

module.exports = router;
