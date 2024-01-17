const express = require('express');
const eligibleAutomaticCover = require('../controllers/eligible-automatic-cover');
const ineligibleGef = require('../controllers/ineligible-gef');
const ineligibleAutomaticCover = require('../controllers/ineligible-automatic-cover');
const { validateRole, validateToken, validateBank } = require('../middleware');
const { MAKER } = require('../constants/roles');

const router = express.Router();

router.get('/application-details/:dealId/eligible-automatic-cover', [validateToken, validateBank, validateRole({ role: [MAKER] })], (req, res) =>
  eligibleAutomaticCover(req, res),
);

router.get('/application-details/:dealId/ineligible-automatic-cover', [validateToken, validateBank, validateRole({ role: [MAKER] })], (req, res) =>
  ineligibleAutomaticCover(req, res),
);

router.get('/ineligible-gef', [validateToken, validateRole({ role: [MAKER] })], (req, res) => ineligibleGef(req, res));

module.exports = router;
