const express = require('express');
const { acceptUkefDecision } = require('../controllers/review-decision');
const { applicationDetails } = require('../controllers/application-details');
const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.get('/application-details/:applicationId/review-decision', validateToken, (req, res) => applicationDetails(req, res));
router.post('/application-details/:applicationId/review-decision', validateToken, (req, res) => acceptUkefDecision(req, res));

module.exports = router;
