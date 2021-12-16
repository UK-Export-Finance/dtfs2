const express = require('express');
const {
  providedFacility,
  validateProvidedFacility,
} = require('../controllers/provided-facility');
const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.get('/application-details/:dealId/facilities/:facilityId/provided-facility', validateToken, (req, res) => providedFacility(req, res));
router.post('/application-details/:dealId/facilities/:facilityId/provided-facility', validateToken, (req, res) => validateProvidedFacility(req, res));

module.exports = router;
