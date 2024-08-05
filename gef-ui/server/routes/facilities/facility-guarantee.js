const express = require('express');
const { facilityGuarantee, updateFacilityGuarantee } = require('../../controllers/facility-guarantee');
const { validateRole, validateToken, validateBank } = require('../../middleware');
const { MAKER } = require('../../constants/roles');

const router = express.Router();

router.get(
  '/application-details/:dealId/facilities/:facilityId/facility-guarantee',
  [validateToken, validateBank, validateRole({ role: [MAKER] })],
  (req, res) => facilityGuarantee(req, res),
);
router.post(
  '/application-details/:dealId/facilities/:facilityId/facility-guarantee',
  [validateToken, validateBank, validateRole({ role: [MAKER] })],
  (req, res) => updateFacilityGuarantee(req, res),
);

module.exports = router;
