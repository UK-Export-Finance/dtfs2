const express = require('express');
const { facilityCurrency, updateFacilityCurrency } = require('../controllers/facility-currency');
const { validateRole, validateToken, validateBank } = require('../middleware');

const router = express.Router();

router.get(
  '/application-details/:dealId/facilities/:facilityId/facility-currency',
  [validateToken, validateBank, validateRole({ role: ['maker'] })],
  (req, res) => facilityCurrency(req, res),
);
router.post(
  '/application-details/:dealId/facilities/:facilityId/facility-currency',
  [validateToken, validateBank, validateRole({ role: ['maker'] })],
  (req, res) => updateFacilityCurrency(req, res),
);

module.exports = router;
