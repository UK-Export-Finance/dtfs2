const express = require('express');
const { acceptUkefDecision } = require('../controllers/review-decision');
const { applicationDetails } = require('../controllers/application-details');
const { validateRole, validateToken, validateBank } = require('../middleware');
const { MAKER } = require('../constants/roles');

const router = express.Router();

router.get('/application-details/:dealId/review-decision', [validateToken, validateBank, validateRole({ role: [MAKER] })], (req, res) =>
  applicationDetails(req, res),
);
router.post('/application-details/:dealId/review-decision', [validateToken, validateBank, validateRole({ role: [MAKER] })], (req, res) =>
  acceptUkefDecision(req, res),
);

module.exports = router;
