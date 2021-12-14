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

// unissued facility list
router.get('/application-details/:applicationId/unissued-facilities', validateToken, (req, res) => applicationDetails(req, res));
// get change unissued facility from facility list
router.get('/application-details/:applicationId/unissued-facilities/:facilityId/about-facility', validateToken, (req, res) =>
  changeUnissuedAboutFacility(req, res));
// get change unissued facility from application preview
router.get('/application-details/:applicationId/unissued-facilities-change/:facilityId/about-facility', validateToken, (req, res) =>
  changeUnissuedAboutFacilityChange(req, res));
// post change unissued facility to issued from facility list
router.post('/application-details/:applicationId/unissued-facilities/:facilityId/about-facility', validateToken, (req, res) =>
  postChangeUnissuedAboutFacility(req, res));
// post change unissued facilities to issued from application preview
router.post('/application-details/:applicationId/unissued-facilities-change/:facilityId/about-facility', validateToken, (req, res) =>
  postChangeUnissuedAboutFacilityChange(req, res));

module.exports = router;
