const express = require('express');
const {
  providedFacility,
  validateProvidedFacility,
} = require('../controllers/provided-facility');
const { validateRole, validateToken, validateBank } = require('../middleware');

const router = express.Router();

router.get(
  '/application-details/:dealId/facilities/:facilityId/provided-facility',
  [validateToken, validateBank, validateRole({ role: ['maker'] })],
  (req, res) => providedFacility(req, res),
);
router.post(
  '/application-details/:dealId/facilities/:facilityId/provided-facility',
  [validateToken, validateBank, validateRole({ role: ['maker'] })],
  (req, res) => validateProvidedFacility(req, res),
);

module.exports = router;
