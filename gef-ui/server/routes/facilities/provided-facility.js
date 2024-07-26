const express = require('express');
const { providedFacility, validateProvidedFacility } = require('../../controllers/provided-facility');
const { validateRole, validateToken, validateBank } = require('../../middleware');
const { MAKER } = require('../../constants/roles');

const router = express.Router();

router.get(
  '/application-details/:dealId/facilities/:facilityId/provided-facility',
  [validateToken, validateBank, validateRole({ role: [MAKER] })],
  (req, res) => providedFacility(req, res),
);
router.post(
  '/application-details/:dealId/facilities/:facilityId/provided-facility',
  [validateToken, validateBank, validateRole({ role: [MAKER] })],
  (req, res) => validateProvidedFacility(req, res),
);

module.exports = router;
