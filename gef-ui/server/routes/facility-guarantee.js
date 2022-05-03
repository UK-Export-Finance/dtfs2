const express = require('express');
const { facilityGuarantee, updateFacilityGuarantee } = require('../controllers/facility-guarantee');
const { validateRole, validateToken, validateBank } = require('../middleware');

const router = express.Router();

router.get(
  '/application-details/:dealId/facilities/:facilityId/facility-guarantee',
  [validateToken, validateBank, validateRole({ role: ['maker'] })],
  (req, res) => facilityGuarantee(req, res),
);
router.post(
  '/application-details/:dealId/facilities/:facilityId/facility-guarantee',
  [validateToken, validateBank, validateRole({ role: ['maker'] })],
  (req, res) => updateFacilityGuarantee(req, res),
);

module.exports = router;
