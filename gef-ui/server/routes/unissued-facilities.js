const express = require('express');
const { applicationDetails } = require('../controllers/application-details');
const {
  changeUnissuedAboutFacility,
  changeUnissuedAboutFacilityChange,
  postChangeUnissuedAboutFacility,
  postChangeUnissuedAboutFacilityChange,
} = require('../controllers/unissued-facilities');
const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.get('/application-details/:applicationId/unissued-facilities', validateToken, (req, res) => applicationDetails(req, res));
router.get('/application-details/:applicationId/unissued-facilities/:facilityId/about-facility', validateToken, (req, res) => changeUnissuedAboutFacility(req, res));
router.get('/application-details/:applicationId/unissued-facilities-change/:facilityId/about-facility', validateToken, (req, res) => changeUnissuedAboutFacilityChange(req, res));
router.post('/application-details/:applicationId/unissued-facilities/:facilityId/about-facility', validateToken, (req, res) => postChangeUnissuedAboutFacility(req, res));
router.post('/application-details/:applicationId/unissued-facilities-change/:facilityId/about-facility', validateToken, (req, res) => postChangeUnissuedAboutFacilityChange(req, res));

module.exports = router;
