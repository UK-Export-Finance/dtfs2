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

/**
 * @openapi
 * /application-details/:dealId/unissued-facilities:
 *   get:
 *     summary: Get the application details page.
 *     tags: [Portal - Gef]
 *     description: Get the application details page.
 *     parameters:
 *       - in: path
 *         name: dealId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get('/application-details/:dealId/unissued-facilities', [validateToken, validateBank, validateRole({ role: [MAKER] })], (req, res) =>
  applicationDetails(req, res),
);

/**
 * @openapi
 * /application-details/:dealId/unissued-facilities/:facilityId/about:
 *   get:
 *     summary: Handles the request to change an unissued facility.
 *     tags: [Portal - Gef]
 *     description: Handles the request to change an unissued facility.
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID and facility ID
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post function for changing unissued facilities to issued from unissued facilities list
 *     tags: [Portal - Gef]
 *     description: Post function for changing unissued facilities to issued from unissued facilities list
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID and facility ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router
  .route('/application-details/:dealId/unissued-facilities/:facilityId/about')
  .all([validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(changeUnissuedFacility)
  .post(postChangeUnissuedFacility);

/**
 * @openapi
 * /application-details/:dealId/unissued-facilities/:facilityId/change:
 *   get:
 *     summary: Renders about facility change page for unissued facilities
 *     tags: [Portal - Gef]
 *     description: Renders about facility change page for unissued facilities
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID and facility ID
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post for changing unissued facilities from application preview
 *     tags: [Portal - Gef]
 *     description: Post for changing unissued facilities from application preview
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID and facility ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router
  .route('/application-details/:dealId/unissued-facilities/:facilityId/change')
  .all([validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(changeUnissuedFacilityPreview)
  .post(postChangeUnissuedFacilityPreview);

/**
 * @openapi
 * /application-details/:dealId/unissued-facilities/:facilityId/change-to-unissued:
 *   get:
 *     summary: Renders about facility change page for unissued facilities
 *     tags: [Portal - Gef]
 *     description: Renders about facility change page for unissued facilities
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID and facility ID
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post function for changing changedToIssued facility back to unissued
 *     tags: [Portal - Gef]
 *     description: Post function for changing changedToIssued facility back to unissued
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID and facility ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router
  .route('/application-details/:dealId/unissued-facilities/:facilityId/change-to-unissued')
  .all([validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(changeIssuedToUnissuedFacility)
  .post(postChangeIssuedToUnissuedFacility);

/**
 * @openapi
 * /application-details/:dealId/unissued-facilities/:facilityId/facility-end-date:
 *   get:
 *     summary: Get facility end date from unissued facilities page
 *     tags: [Portal - Gef]
 *     description: Get facility end date from unissued facilities page
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID and facility ID
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post facility end date from unissued facilities page
 *     tags: [Portal - Gef]
 *     description: Post facility end date from unissued facilities page
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID and facility ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router
  .route('/application-details/:dealId/unissued-facilities/:facilityId/facility-end-date')
  .all([validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(getFacilityEndDateFromUnissuedFacilitiesPage)
  .post(postFacilityEndDateFromUnissuedFacilitiesPage);

/**
 * @openapi
 * /application-details/:dealId/unissued-facilities/:facilityId/facility-end-date/change:
 *   get:
 *     summary: Get facility end date from application preview page
 *     tags: [Portal - Gef]
 *     description: Get facility end date from application preview page
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID and facility ID
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post facility end date from application preview page
 *     tags: [Portal - Gef]
 *     description: Post facility end date from application preview page
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID and facility ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router
  .route('/application-details/:dealId/unissued-facilities/:facilityId/facility-end-date/change')
  .all([validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(getFacilityEndDateFromApplicationPreviewPage)
  .post(postFacilityEndDateFromApplicationPreviewPage);

/**
 * @openapi
 * /application-details/:dealId/unissued-facilities/:facilityId/bank-review-date:
 *   get:
 *     summary: Get bank review date from unissued facilities page
 *     tags: [Portal - Gef]
 *     description: Get bank review date from unissued facilities page
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID and facility ID
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post bank review date from unissued facilities page
 *     tags: [Portal - Gef]
 *     description: Post bank review date from unissued facilities page
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID and facility ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router
  .route('/application-details/:dealId/unissued-facilities/:facilityId/bank-review-date')
  .all([validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(getBankReviewDateFromUnissuedFacilitiesPage)
  .post(postBankReviewDateFromUnissuedFacilitiesPage);

/**
 * @openapi
 * /application-details/:dealId/unissued-facilities/:facilityId/bank-review-date/change:
 *   get:
 *     summary: Get bank review date from application preview page
 *     tags: [Portal - Gef]
 *     description: Get bank review date from unissued facilities page
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID and facility ID
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Post bank review date from application preview page
 *     tags: [Portal - Gef]
 *     description: Post bank review date from application preview page
 *     parameters:
 *       - in: path
 *         name: dealId, facilityId
 *         schema:
 *           type: string
 *         required: true
 *         description: the deal ID and facility ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorised insertion
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router
  .route('/application-details/:dealId/unissued-facilities/:facilityId/bank-review-date/change')
  .all([validateToken, validateBank, validateRole({ role: [MAKER] })])
  .get(getBankReviewDateFromApplicationPreviewPage)
  .post(postBankReviewDateFromApplicationPreviewPage);

module.exports = router;
