const express = require('express');
const { acceptUkefDecision } = require('../controllers/review-decision');
const { applicationDetails } = require('../controllers/application-details');
const { validateRole, validateToken, validateBank } = require('../middleware');

const router = express.Router();

router.get(
  '/application-details/:dealId/review-decision',
  [validateToken, validateBank, validateRole({ role: ['maker'] })],
  (req, res) => applicationDetails(req, res),
);
router.post(
  '/application-details/:dealId/review-decision',
  [validateToken, validateBank, validateRole({ role: ['maker'] })],
  (req, res) => acceptUkefDecision(req, res),
);

module.exports = router;
