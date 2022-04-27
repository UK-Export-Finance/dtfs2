const express = require('express');
const { applicationDetails } = require('../controllers/application-details');
const {
  changeUnissuedFacility,
  changeUnissuedFacilityPreview,
  postChangeUnissuedFacility,
  postChangeUnissuedFacilityPreview,
  changeIssuedToUnissuedFacility,
  postChangeIssuedToUnissuedFacility,
} = require('../controllers/unissued-facilities');
const validateToken = require('../middleware/validateToken');

const router = express.Router();

// unissued facility list
router.get('/application-details/:dealId/unissued-facilities', validateToken, (req, res) => applicationDetails(req, res));

// get change unissued facility from facility list
router.get('/application-details/:dealId/unissued-facilities/:facilityId/about', validateToken, (req, res) =>
  changeUnissuedFacility(req, res));
// post change unissued facility to issued from facility list
router.post('/application-details/:dealId/unissued-facilities/:facilityId/about', validateToken, (req, res) =>
  postChangeUnissuedFacility(req, res));

// get change unissued facility from application preview
router.get('/application-details/:dealId/unissued-facilities/:facilityId/change', validateToken, (req, res) =>
  changeUnissuedFacilityPreview(req, res));
// post change unissued facilities to issued from application preview
router.post('/application-details/:dealId/unissued-facilities/:facilityId/change', validateToken, (req, res) =>
  postChangeUnissuedFacilityPreview(req, res));

// get change issued facility to unissued from application preview
router.get('/application-details/:dealId/unissued-facilities/:facilityId/change-to-unissued', validateToken, (req, res) =>
  changeIssuedToUnissuedFacility(req, res));
// post change issued facility to unissued from application preview
router.post('/application-details/:dealId/unissued-facilities/:facilityId/change-to-unissued', validateToken, (req, res) =>
  postChangeIssuedToUnissuedFacility(req, res));

module.exports = router;
