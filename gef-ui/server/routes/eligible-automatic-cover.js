const express = require('express');
const eligibleAutomaticCover = require('../controllers/eligible-automatic-cover');
const ineligibleGef = require('../controllers/ineligible-gef');
const ineligibleAutomaticCover = require('../controllers/ineligible-automatic-cover');
const { validateRole, validateToken, validateBank } = require('../middleware');

const router = express.Router();

router.get(
  '/application-details/:dealId/eligible-automatic-cover',
  [validateToken, validateBank, validateRole({ role: ['maker'] })],
  (req, res) => eligibleAutomaticCover(req, res),
);

router.get(
  '/application-details/:dealId/ineligible-automatic-cover',
  [validateToken, validateBank, validateRole({ role: ['maker'] })],
  (req, res) => ineligibleAutomaticCover(req, res),
);

router.get(
  '/ineligible-gef',
  [validateToken, validateBank, validateRole({ role: ['maker'] })],
  (req, res) => ineligibleGef(req, res),
);

module.exports = router;
