const express = require('express');
const {
  facilityValue,
  updateFacilityValue,
} = require('../controllers/facility-value');
const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.get('/application-details/:applicationId/facilities/:facilityId/facility-value', validateToken, (req, res) => facilityValue(req, res));
router.post('/application-details/:applicationId/facilities/:facilityId/facility-value', validateToken, (req, res) => updateFacilityValue(req, res));

module.exports = router;
