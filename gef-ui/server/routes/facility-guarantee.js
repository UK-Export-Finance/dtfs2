const express = require('express');
const {
  facilityGuarantee,
  updateFacilityGuarantee,
} = require('../controllers/facility-guarantee');
const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.get('/application-details/:dealId/facilities/:facilityId/facility-guarantee', validateToken, (req, res) => facilityGuarantee(req, res));
router.post('/application-details/:dealId/facilities/:facilityId/facility-guarantee', validateToken, (req, res) => updateFacilityGuarantee(req, res));

module.exports = router;
