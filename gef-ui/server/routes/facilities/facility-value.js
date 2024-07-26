const express = require('express');
const { facilityValue, updateFacilityValue } = require('../../controllers/facility-value');
const { validateRole, validateToken, validateBank } = require('../../middleware');
const { MAKER } = require('../../constants/roles');

const router = express.Router();

router.get('/application-details/:dealId/facilities/:facilityId/facility-value', [validateToken, validateBank, validateRole({ role: [MAKER] })], (req, res) =>
  facilityValue(req, res),
);
router.post('/application-details/:dealId/facilities/:facilityId/facility-value', [validateToken, validateBank, validateRole({ role: [MAKER] })], (req, res) =>
  updateFacilityValue(req, res),
);

module.exports = router;
