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
const { validateRole, validateToken, validateBank } = require('../middleware');
const { MAKER } = require('../constants/roles');
const {
  getFacilityEndDateFromApplicationPreviewPage,
  getFacilityEndDateFromUnissuedFacilitiesPage,
} = require('../controllers/facility-end-date/get-facility-end-date');
const {
  postFacilityEndDateFromApplicationPreviewPage,
  postFacilityEndDateFromUnissuedFacilitiesPage,
} = require('../controllers/facility-end-date/post-facility-end-date');
const {
  getBankReviewDateFromApplicationPreviewPage,
  getBankReviewDateFromUnissuedFacilitiesPage,
} = require('../controllers/bank-review-date/get-bank-review-date');
const {
  postBankReviewDateFromApplicationPreviewPage,
  postBankReviewDateFromUnissuedFacilitiesPage,
} = require('../controllers/bank-review-date/post-bank-review-date');

const router = express.Router();

// unissued facility list
router.get('/application-details/:dealId/unissued-facilities', [validateToken, validateBank, validateRole({ role: [MAKER] })], (req, res) =>
  applicationDetails(req, res),
);

// get change unissued facility from facility list
router.get('/application-details/:dealId/unissued-facilities/:facilityId/about', [validateToken, validateBank, validateRole({ role: [MAKER] })], (req, res) =>
  changeUnissuedFacility(req, res),
);
// post change unissued facility to issued from facility list
router.post('/application-details/:dealId/unissued-facilities/:facilityId/about', [validateToken, validateBank, validateRole({ role: [MAKER] })], (req, res) =>
  postChangeUnissuedFacility(req, res),
);

// get change unissued facility from application preview
router.get('/application-details/:dealId/unissued-facilities/:facilityId/change', [validateToken, validateBank, validateRole({ role: [MAKER] })], (req, res) =>
  changeUnissuedFacilityPreview(req, res),
);
// post change unissued facilities to issued from application preview
router.post('/application-details/:dealId/unissued-facilities/:facilityId/change', [validateToken, validateBank, validateRole({ role: [MAKER] })], (req, res) =>
  postChangeUnissuedFacilityPreview(req, res),
);

// get change issued facility to unissued from application preview
router.get(
  '/application-details/:dealId/unissued-facilities/:facilityId/change-to-unissued',
  [validateToken, validateBank, validateRole({ role: [MAKER] })],
  (req, res) => changeIssuedToUnissuedFacility(req, res),
);
// post change issued facility to unissued from application preview
router.post(
  '/application-details/:dealId/unissued-facilities/:facilityId/change-to-unissued',
  [validateToken, validateBank, validateRole({ role: [MAKER] })],
  (req, res) => postChangeIssuedToUnissuedFacility(req, res),
);

router
  .route('/application-details/:dealId/unissued-facilities/:facilityId/facility-end-date')
  .all([validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(getFacilityEndDateFromUnissuedFacilitiesPage)
  .post(postFacilityEndDateFromUnissuedFacilitiesPage);

router
  .route('/application-details/:dealId/unissued-facilities/:facilityId/facility-end-date/change')
  .all([validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(getFacilityEndDateFromApplicationPreviewPage)
  .post(postFacilityEndDateFromApplicationPreviewPage);

router
  .route('/application-details/:dealId/unissued-facilities/:facilityId/bank-review-date')
  .all([validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(getBankReviewDateFromUnissuedFacilitiesPage)
  .post(postBankReviewDateFromUnissuedFacilitiesPage);

router
  .route('/application-details/:dealId/unissued-facilities/:facilityId/bank-review-date/change')
  .all([validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(getBankReviewDateFromApplicationPreviewPage)
  .post(postBankReviewDateFromApplicationPreviewPage);

module.exports = router;
