const express = require('express');
const { applicationDetails } = require('../controllers/application-details');
const {
  changeUnissuedFacility,
  changeUnissuedFacilityPreview,
  postChangeUnissuedFacility,
  postChangeUnissuedFacilityPreview,
  // changeIssuedToUnissuedFacility,
  // postChangeIssuedToUnissuedFacility,
} = require('../controllers/unissued-facilities');
const { validateRole, validateToken, validateBank } = require('../middleware');

const router = express.Router();

// unissued facility list
router.get('/application-details/:dealId/unissued-facilities', [validateToken, validateBank, validateRole({ role: ['maker'] })], (req, res) => applicationDetails(req, res));

// get change unissued facility from facility list
router.get('/application-details/:dealId/unissued-facilities/:facilityId/about', [validateToken, validateBank, validateRole({ role: ['maker'] })], (req, res) =>
  changeUnissuedFacility(req, res));
// post change unissued facility to issued from facility list
router.post('/application-details/:dealId/unissued-facilities/:facilityId/about', [validateToken, validateBank, validateRole({ role: ['maker'] })], (req, res) =>
  postChangeUnissuedFacility(req, res));

// get change unissued facility from application preview
router.get('/application-details/:dealId/unissued-facilities/:facilityId/change', [validateToken, validateBank, validateRole({ role: ['maker'] })], (req, res) =>
  changeUnissuedFacilityPreview(req, res));
// post change unissued facilities to issued from application preview
router.post('/application-details/:dealId/unissued-facilities/:facilityId/change', [validateToken, validateBank, validateRole({ role: ['maker'] })], (req, res) =>
  postChangeUnissuedFacilityPreview(req, res));

// TODO: DTFS2-5616
// // get change issued facility to unissued from application preview
// router.get('/application-details/:dealId/unissued-facilities/:facilityId/change-to-unissued', validateToken, (req, res) =>
//   changeIssuedToUnissuedFacility(req, res));
// // post change issued facility to unissued from application preview
// router.post('/application-details/:dealId/unissued-facilities/:facilityId/change-to-unissued', validateToken, (req, res) =>
//   postChangeIssuedToUnissuedFacility(req, res));

module.exports = router;
