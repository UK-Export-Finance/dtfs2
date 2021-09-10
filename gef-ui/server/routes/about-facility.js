const express = require('express');
const {
  aboutFacility,
  validateAboutFacility,
} = require('../controllers/about-facility');
const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.get('/application-details/:applicationId/facilities/:facilityId/about-facility', validateToken, (req, res) => aboutFacility(req, res));
router.post('/application-details/:applicationId/facilities/:facilityId/about-facility', validateToken, (req, res) => validateAboutFacility(req, res));

module.exports = router;
