const express = require('express');
const { facilityCurrency, updateFacilityCurrency } = require('../../controllers/facility-currency');
const { validateRole, validateToken, validateBank } = require('../../middleware');
const { MAKER } = require('../../constants/roles');

const router = express.Router();

router.get(
  '/application-details/:dealId/facilities/:facilityId/facility-currency',
  [validateToken, validateBank, validateRole({ role: [MAKER] })],
  (req, res) => facilityCurrency(req, res),
);
router.post(
  '/application-details/:dealId/facilities/:facilityId/facility-currency',
  [validateToken, validateBank, validateRole({ role: [MAKER] })],
  (req, res) => updateFacilityCurrency(req, res),
);

module.exports = router;
