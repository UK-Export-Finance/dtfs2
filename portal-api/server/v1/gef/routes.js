const { HttpStatusCode } = require('axios');
const express = require('express');
const { validatePortalFacilityAmendmentsEnabled } = require('@ukef/dtfs2-common');
const { MAKER, CHECKER, READ_ONLY, ADMIN } = require('../roles/roles');
const { validateUserHasAtLeastOneAllowedRole } = require('../roles/validate-user-has-at-least-one-allowed-role');
const { mongoIdValidation } = require('../validation/route-validators/route-validators');

const { fileUpload } = require('../middleware/file-upload');

const application = require('./controllers/application.controller');
const cloneApplication = require('./controllers/clone-gef-deal.controller');
const facilities = require('./controllers/facilities.controller');
const mandatoryCriteriaVersioned = require('./controllers/mandatoryCriteriaVersioned.controller');
const eligibilityCriteria = require('./controllers/eligibilityCriteria.controller');
const externalApi = require('./controllers/externalApi.controller');
const files = require('./controllers/files.controller');
const companies = require('../controllers/companies.controller');
const { getAllFacilityAmendments } = require('../controllers/amendments/get-all-amendments.controller');
const { getAmendment } = require('../controllers/amendments/get-amendment.controller');
const { getFacilityAmendmentsOnDeal } = require('../controllers/amendments/get-amendments-on-deal.controller');
const { getPortalFacilityAmendmentsOnDeal } = require('../controllers/amendments/get-portal-amendments-on-deal.controller');
const { patchAmendment } = require('../controllers/amendments/patch-amendment.controller');
const { putAmendment } = require('../controllers/amendments/put-amendment.controller');
const { deleteAmendment } = require('../controllers/amendments/delete-amendment.controller');
const { patchAmendmentStatus } = require('../controllers/amendments/patch-amendment-status.controller');
const { patchSubmitAmendment } = require('../controllers/amendments/patch-submit-amendment.controller');
const { handleExpressValidatorResult } = require('../validation/route-validators/express-validator-result-handler');
const { validatePutPortalFacilityAmendmentPayload } = require('../validation/route-validators/amendments/validate-put-portal-facility-amendment-payload');
const { validatePatchPortalFacilityAmendmentPayload } = require('../validation/route-validators/amendments/validate-patch-portal-facility-amendment-payload');
const {
  validatePatchPortalFacilitySubmitAmendmentPayload,
} = require('../validation/route-validators/amendments/validate-patch-portal-facility-submit-amendment-payload');
const {
  validatePatchPortalFacilityAmendmentStatusPayload,
} = require('../validation/route-validators/amendments/validate-patch-portal-facility-amendment-status-payload');
const { validateDeletePortalFacilityAmendmentPayload } = require('../validation/route-validators/amendments/validate-delete-portal-facility-amendment-payload');
const {
  getLatestAmendmentFacilityValueAndCoverEndDate,
} = require('../controllers/amendments/get-latest-amendment-facility-value-and-cover-end-date.controller');

const router = express.Router();

// Application
/**
 * @openapi
 * /application:
 *  get:
 *    summary: Get all applications
 *    tags: [Applications]
 *    responses:
 *      200:
 *        description: List of applications
 * post:
 *    summary: Create a new application
 *    tags: [Applications]
 *    parameters:
 *      - in: body
 *        name: body
 *        description: The application to create.
 *        schema:
 *          type: object
 *    responses:
 *      201:
 *        description: Application created successfully
 *      400:
 *        description: Invalid Id
 *      422:
 *        description: Validation Errors
 *      500:
 *       description: Internal Server Error
 */
router
  .route('/application')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), application.getAll)
  .post(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), application.create);

/**
 * @openapi
 * /application/clone:
 *  post:
 *    summary: Clone an existing application
 *    tags: [Applications]
 *    parameters:
 *      - in: body
 *        name: body
 *        description: The application to clone.
 *        schema:
 *          type: object
 *    responses:
 *      201:
 *        description: Application cloned successfully
 *      400:
 *       description: Invalid Id
 *      404:
 *       description: Application to clone not found
 *      500:
 *       description: Internal Server Error
 */
router.route('/application/clone').post(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), cloneApplication.clone);

/**
 * @openapi
 * /application/:id:
 *  get:
 *    summary: Get application by ID
 *    tags: [Applications]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: The ID of the application to retrieve
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: Application retrieved successfully
 *      400:
 *        description: Invalid Id
 *      204:
 *        description: No Content
 *  put:
 *    summary: Update application by ID
 *    tags: [Applications]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: The ID of the application to update
 *        schema:
 *          type: string
 *      - in: body
 *        name: body
 *        description: The application data to update.
 *        schema:
 *          type: object
 *    responses:
 *      200:
 *        description: Application updated successfully
 *      400:
 *        description: Invalid Id
 *      404:
 *        description: Application to update not found
 *      422:
 *        description: Validation Errors
 *      500:
 *        description: Internal Server Error
 * delete:
 *    summary: Delete application by ID
 *    tags: [Applications]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: The ID of the application to delete
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: Application deleted successfully
 *      400:
 *        description: Invalid Id
 *      404:
 *        description: Application to delete not found
 *      500:
 *        description: Internal Server Error
 */
router
  .route('/application/:id')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), application.getById)
  .put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER] }), application.update) // checker can add a comment
  .delete(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), application.delete);

/**
 * @openapi
 * /application/supporting-information/:id:
 *  put:
 *    summary: Update supporting information for an application
 *    tags: [Applications]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: The ID of the application to update supporting information for
 *        schema:
 *          type: string
 *      - in: body
 *        name: body
 *        description: The supporting information data to update.
 *        schema:
 *          type: object
 *    responses:
 *      200:
 *        description: Supporting information updated successfully
 *      400:
 *        description: Invalid Id
 *      404:
 *        description: Application to update supporting information not found
 *      500:
 *        description: Internal Server Error
 */
router
  .route('/application/supporting-information/:id')
  .put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER] }), application.updateSupportingInformation);

/**
 * @openapi
 * /application/status/:id:
 *  get:
 *    summary: Get application status by ID
 *    tags: [Applications]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: The ID of the application to retrieve the status for
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: Application status retrieved successfully
 *      204:
 *        description: No Content
 *      400:
 *        description: Invalid Id
 * put:
 *    summary: Change application status by ID
 *    tags: [Applications]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: The ID of the application to change the status for
 *        schema:
 *          type: string
 *      - in: body
 *        name: status
 *        description: The new status for the application.
 *        schema:
 *          type: string
 *      responses:
 *        200:
 *          description: Application status changed successfully
 *        400:
 *          description: Invalid Id
 *        404:
 *          description: Application to change status not found
 *        422:
 *          description: Validation Errors
 *        500:
 *          description: Internal Server Error
 */
router
  .route('/application/status/:id')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), application.getStatus)
  .put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER] }), application.changeStatus);

// Facilities
/**
 * @openapi
 * /facilities:
 *  get:
 *    summary: Get all facilities for a deal
 *    tags: [Facilities]
 *    parameters:
 *      - in: query
 *        name: dealId
 *        required: true
 *        description: The ID of the deal to retrieve facilities for
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: List of facilities for the specified deal
 *      400:
 *        description: Invalid Id
 *      404:
 *        description: No facilities found for the specified deal
 *      500:
 *        description: Internal Server Error
 *  post:
 *    summary: Create a new facility
 *    tags: [Facilities]
 *    parameters:
 *      - in: body
 *        name: facility
 *        description: The facility to create.
 *        schema:
 *          type: object
 *    responses:
 *      201:
 *        description: Facility created successfully
 *      400:
 *        description: Invalid request body
 *      500:
 *        description: Internal Server Error
 *  delete:
 *    summary: Delete all facilities for a deal
 *    tags: [Facilities]
 *    parameters:
 *      - in: query
 *        name: dealId
 *        required: true
 *        description: The ID of the deal to delete facilities for
 *        schema:
 *          type: string
 *   responses:
 *     200:
 *       description: Facilities deleted successfully
 *     400:
 *       description: Invalid Id
 *     500:
 *       description: Internal Server Error
 */
router
  .route('/facilities')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), facilities.getFacilitiesByDealId)
  .post(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), facilities.create)
  .delete(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), facilities.deleteByDealId);

/**
 * @openapi
 * /facilities/amendments:
 *  get:
 *    summary: Get all facility amendments
 *    tags: [Facility Amendments]
 *   responses:
 *     200:
 *       description: List of facility amendments
 *     400:
 *       description: Invalid request
 *     404:
 *       description: No facility amendments found
 *     500:
 *       description: Internal Server Error
 */
router
  .route('/facilities/amendments')
  .all(validatePortalFacilityAmendmentsEnabled, validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER] }), handleExpressValidatorResult)
  .get(getAllFacilityAmendments);

/**
 * @openapi
 * /facilities/:id:
 *  get:
 *    summary: Get facility by ID
 *    tags: [Facilities]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: The ID of the facility to retrieve
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: Facility retrieved successfully
 *      204:
 *        description: No Content
 *      400:
 *        description: Invalid Id
 *      404:
 *        description: Facility not found
 *      500:
 *        description: Internal Server Error
 *  put:
 *    summary: Update facility by ID
 *    tags: [Facilities]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: The ID of the facility to update
 *        schema:
 *          type: string
 *      - in: body
 *        name: body
 *        required: true
 *        description: The facility data to update
 *        schema:
 *          type: object
 *      responses:
 *        200:
 *          description: Facility updated successfully
 *        204:
 *          description: No Content
 *        400:
 *          description: Invalid Id
 *        404:
 *          description: Facility to update not found
 *        422:
 *          description: Validation Errors
 *        500:
 *          description: Internal Server Error
 *  delete:
 *    summary: Delete facility by ID
 *    tags: [Facilities]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: The ID of the facility to delete
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: Facility deleted successfully
 *      400:
 *        description: Invalid Id
 *      404:
 *        description: Facility to delete not found
 *      500:
 *        description: Internal Server Error
 */
router
  .route('/facilities/:id')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), facilities.getById)
  .put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), facilities.updatePUT)
  .delete(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), facilities.delete);

// Eligibility Criteria
/**
 * @openapi
 * /eligibility-criteria:
 *  get:
 *    summary: Get all eligibility criteria
 *    tags: [Eligibility Criteria]
 *    responses:
 *      200:
 *        description: List of eligibility criteria
 *  post:
 *    summary: Create a new eligibility criteria
 *    tags: [Eligibility Criteria]
 *    parameters:
 *      - in: body
 *        name: body
 *        description: The eligibility criteria to create.
 *        schema:
 *          type: object
 *    responses:
 *      201:
 *        description: Eligibility criteria created successfully
 *      400:
 *        description: Invalid request body
 *      500:
 *        description: Internal Server Error
 */
router
  .route('/eligibility-criteria')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), eligibilityCriteria.getAll)
  .post(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [ADMIN] }), eligibilityCriteria.create);

/**
 * @openapi
 * /eligibility-criteria/latest:
 *  get:
 *    summary: Get the latest eligibility criteria
 *    tags: [Eligibility Criteria]
 *    responses:
 *      200:
 *        description: The latest eligibility criteria document.
 */
router
  .route('/eligibility-criteria/latest')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), eligibilityCriteria.getLatest);

/**
 * @openapi
 * /eligibility-criteria/:version:
 *  get:
 *    summary: Get eligibility criteria by version
 *    tags: [Eligibility Criteria]
 *    parameters:
 *      - in: path
 *        name: version
 *        required: true
 *        description: The version of the eligibility criteria to retrieve
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: Eligibility criteria retrieved successfully
 *      400:
 *        description: Invalid version
 *      404:
 *        description: Eligibility criteria for the specified version not found
 *  delete:
 *   summary: Delete eligibility criteria by version
 *    tags: [Eligibility Criteria]
 *    parameters:
 *      - in: path
 *        name: version
 *        required: true
 *        description: The version of the eligibility criteria to delete
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: Eligibility criteria deleted successfully
 *      400:
 *        description: Invalid version
 *    404:
 *      description: Eligibility criteria for the specified version not found
 *    500:
 *      description: Internal Server Error
 */
router
  .route('/eligibility-criteria/:version')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), eligibilityCriteria.getByVersion)
  .delete(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [ADMIN] }), eligibilityCriteria.delete);

// Mandatory Criteria
/**
 * @openapi
 * /mandatory-criteria-versioned:
 *  get:
 *    summary: Get all mandatory criteria versioned
 *    tags: [Mandatory Criteria Versioned]
 *    responses:
 *      200:
 *        description: List of mandatory criteria versioned
 */
router
  .route('/mandatory-criteria-versioned')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), mandatoryCriteriaVersioned.findAll);

/**
 * @openapi
 * /mandatory-criteria-versioned/latest:
 *  get:
 *    summary: Get the latest mandatory criteria versioned
 *    tags: [Mandatory Criteria Versioned]
 *    responses:
 *      200:
 *        description: The latest mandatory criteria versioned document.
 *      400:
 *        description: Invalid request
 *      404:
 *        description: Latest mandatory criteria versioned document not found
 *      500:
 *        description: Internal Server Error
 */
router
  .route('/mandatory-criteria-versioned/latest')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), mandatoryCriteriaVersioned.findLatest);

/**
 * @openapi
 * /mandatory-criteria-versioned/:id:
 *  get:
 *    summary: Get mandatory criteria versioned by ID
 *    tags: [Mandatory Criteria Versioned]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: The ID of the mandatory criteria versioned to retrieve
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: Mandatory criteria versioned retrieved successfully
 *      404:
 *        description: Mandatory criteria versioned not found
 *  delete:
 *    summary: Delete mandatory criteria versioned by ID
 *    tags: [Mandatory Criteria Versioned]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: The ID of the mandatory criteria versioned to delete
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: Mandatory criteria versioned deleted successfully
 *      400:
 *        description: Invalid Mandatory Criteria Id
 *      404:
 *        description: Mandatory criteria versioned not found
 *      500:
 *        description: Internal Server Error
 */
router
  .route('/mandatory-criteria-versioned/:id')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), mandatoryCriteriaVersioned.findOne)
  .delete(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [ADMIN] }), mandatoryCriteriaVersioned.delete);

// File Uploads
/**
 * @openapi
 * /files:
 *  post:
 *    summary: Upload a file
 *    tags: [Files]
 *    parameters:
 *      - in: body
 *        name: file
 *        description: The file to upload.
 *        schema:
 *          type: object
 *          properties:
 *            file:
 *              type: string
 *              format: binary
 *    responses:
 *      201:
 *        description: File uploaded successfully
 *      400:
 *        description: Failed to upload file
 */
router.route('/files').post(
  validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }),
  (req, res, next) => {
    fileUpload(req, res, (error) => {
      if (!error) {
        return next();
      }
      console.error('Unable to upload file %o', error);
      return res.status(HttpStatusCode.BadRequest).json({ status: HttpStatusCode.BadRequest, data: 'Failed to upload file' });
    });
  },
  files.create,
);

/**
 * @openapi
 * /files/:id:
 *  get:
 *    summary: Get file by ID
 *    tags: [Files]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: The ID of the file to retrieve
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: File retrieved successfully
 *     404:
 *        description: File not found
 * delete:
 *    summary: Delete file by ID
 *    tags: [Files]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: The ID of the file to delete
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: File deleted successfully
 *      400:
 *        description: Invalid File Id
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: File to delete not found
 *      500:
 *        description: Internal Server Error
 */
router
  .route('/files/:id')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), files.getById)
  .delete(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), files.delete);

/**
 * @openapi
 * /files/:id/download:
 *  get:
 *    summary: Download file by ID
 *    tags: [Files]
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: The ID of the file to download
 *       schema:
 *         type: string
 *   responses:
 *      200:
 *        description: File downloaded successfully
 *      400:
 *        description: Invalid File Id
 *      404:
 *        description: File not found
 *      500:
 *        description: Internal Server Error
 */
router.route('/files/:id/download').get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), files.downloadFile);

/**
 * @openapi
 * /companies/:registrationNumber:
 *  get:
 *    summary: Get company by registration number
 *    tags: [Companies]
 *    parameters:
 *      - in: path
 *        name: registrationNumber
 *        required: true
 *        description: The registration number of the company to retrieve
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: Company retrieved successfully
 *      400:
 *        description: Invalid registration number
 *      404:
 *        description: Company not found
 */
router.route('/companies/:registrationNumber').get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), companies.getCompanyByRegistrationNumber);

/**
 * @openapi
 * /address/:postcode:
 *  get:
 *    summary: Get addresses by postcode
 *    tags: [Geospatial Addresses]
 *    parameters:
 *      - in: path
 *        name: postcode
 *        required: true
 *        description: The postcode to retrieve addresses for
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: List of addresses for the specified postcode
 *      400:
 *        description: Invalid postcode
 *      404:
 *        description: No addresses found for the specified postcode
 *      422:
 *        description: Unprocessable Entity
 *      500:
 *        description: Internal Server Error
 */
router
  .route('/address/:postcode') // Geospatial Addresses
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, READ_ONLY, ADMIN] }), externalApi.getAddressesByPostcode);

/**
 * @openapi
 * /facilities/:facilityId/amendments/latest-value-and-cover-end-date:
 *  get:
 *    summary: Get the latest amendment's facility value and cover end date for a specific facility
 *    tags: [Facility Amendments]
 *    parameters:
 *      - in: path
 *        name: facilityId
 *        required: true
 *        description: The ID of the facility to retrieve the latest amendment's facility value and cover end date for
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: Latest amendment's facility value and cover end date retrieved successfully
 *      400:
 *        description: Invalid Facility Id
 *      404:
 *        description: Facility or amendments not found
 *      500:
 *        description: Internal Server Error
 */
router
  .route('/facilities/:facilityId/amendments/latest-value-and-cover-end-date')
  .get(
    validatePortalFacilityAmendmentsEnabled,
    validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }),
    mongoIdValidation('facilityId'),
    getLatestAmendmentFacilityValueAndCoverEndDate,
  );

/**
 * @openapi
 * /facilities/:facilityId/amendments/:amendmentId:
 *  get:
 *    summary: Get a specific amendment by ID for a specific facility
 *    tags: [Facility Amendments]
 *    parameters:
 *      - in: path
 *        name: facilityId
 *        required: true
 *        description: The ID of the facility to retrieve the amendment for
 *        schema:
 *          type: string
 *      - in: path
 *        name: amendmentId
 *        required: true
 *        description: The ID of the amendment to retrieve
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: Amendment retrieved successfully
 *      400:
 *        description: Invalid Facility Id or Amendment Id
 *      404:
 *        description: Facility or amendment not found
 *  patch:
 *    summary: Update a specific amendment by ID for a specific facility
 *    tags: [Facility Amendments]
 *    parameters:
 *      - in: path
 *        name: facilityId
 *        required: true
 *        description: The ID of the facility to update the amendment for
 *        schema:
 *          type: string
 *      - in: path
 *        name: amendmentId
 *        required: true
 *        description: The ID of the amendment to update
 *        schema:
 *          type: string
 *      - in: body
 *        name: body
 *        description: The amendment data to update.
 *        schema:
 *          type: object
 *    responses:
 *      200:
 *        description: Amendment updated successfully
 *      400:
 *        description: Invalid Facility Id or Amendment Id
 *      404:
 *        description: Facility or amendment to update not found
 *      422:
 *        description: Validation Errors
 *      500:
 *        description: Internal Server Error
 *  delete:
 *    summary: Delete a specific amendment by ID for a specific facility
 *    tags: [Facility Amendments]
 *    parameters:
 *      - in: path
 *        name: facilityId
 *        required: true
 *        description: The ID of the facility to delete the amendment for
 *        schema:
 *          type: string
 *      - in: path
 *        name: amendmentId
 *        required: true
 *        description: The ID of the amendment to delete
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: Amendment deleted successfully
 *      400:
 *        description: Invalid Facility Id or Amendment Id
 *      404:
 *        description: Facility or amendment to delete not found
 *      500:
 *        description: Internal Server Error
 */
router
  .route('/facilities/:facilityId/amendments/:amendmentId')
  .all(validatePortalFacilityAmendmentsEnabled, mongoIdValidation('facilityId'), mongoIdValidation('amendmentId'), handleExpressValidatorResult)
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER] }), getAmendment)
  .patch(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), validatePatchPortalFacilityAmendmentPayload, patchAmendment)
  .delete(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), validateDeletePortalFacilityAmendmentPayload, deleteAmendment);

/**
 * @openapi
 * /facilities/:facilityId/amendments/:amendmentId/status:
 * patch:
 *    summary: Update the status of a specific amendment by ID for a specific facility
 *    tags: [Facility Amendments]
 *    parameters:
 *      - in: path
 *        name: facilityId
 *        required: true
 *        description: The ID of the facility to update the amendment status for
 *        schema:
 *          type: string
 *      - in: path
 *        name: amendmentId
 *        required: true
 *        description: The ID of the amendment to update the status for
 *        schema:
 *          type: string
 *      - in: body
 *        name: body
 *        description: The status update data and email variables
 *        schema:
 *          type: object
 *    responses:
 *      200:
 *        description: Amendment status updated successfully
 *      400:
 *        description: Invalid Facility Id or Amendment Id
 *      404:
 *        description: Facility or amendment not found
 *      500:
 *        description: Internal Server Error
 */
router
  .route('/facilities/:facilityId/amendments/:amendmentId/status')
  .patch(
    validatePortalFacilityAmendmentsEnabled,
    validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER] }),
    mongoIdValidation('facilityId'),
    mongoIdValidation('amendmentId'),
    handleExpressValidatorResult,
    validatePatchPortalFacilityAmendmentStatusPayload,
    patchAmendmentStatus,
  );

/**
 * @openapi
 * /facilities/:facilityId/amendments/:amendmentId/submit-amendment:
 *  patch:
 *    summary: Submit a specific amendment by ID for a specific facility
 *    tags: [Facility Amendments]
 *    parameters:
 *      - in: path
 *        name: facilityId
 *        required: true
 *        description: The ID of the facility to submit the amendment for
 *        schema:
 *          type: string
 *      - in: path
 *        name: amendmentId
 *        required: true
 *        description: The ID of the amendment to submit
 *        schema:
 *          type: string
 *      - in: body
 *        name: body
 *        description: The submission data and update variables
 *        schema:
 *          type: object
 *    responses:
 *      200:
 *        description: Amendment submitted successfully
 *      400:
 *        description: Invalid Facility Id or Amendment Id
 *      404:
 *        description: Facility or amendment not found
 *      500:
 *        description: Internal Server Error
 */
router
  .route('/facilities/:facilityId/amendments/:amendmentId/submit-amendment')
  .patch(
    validatePortalFacilityAmendmentsEnabled,
    validateUserHasAtLeastOneAllowedRole({ allowedRoles: [CHECKER] }),
    mongoIdValidation('facilityId'),
    mongoIdValidation('amendmentId'),
    handleExpressValidatorResult,
    validatePatchPortalFacilitySubmitAmendmentPayload,
    patchSubmitAmendment,
  );

/**
 * @openapi
 * /facilities/:facilityId/amendments:
 *  put:
 *    summary: Upserts draft amendment into the database
 *    tags: [Facility Amendments]
 *    parameters:
 *      - in: path
 *        name: facilityId
 *        required: true
 *        description: The ID of the facility to upsert the amendment for
 *        schema:
 *          type: string
 *      - in: body
 *        name: body
 *        description: The amendment data
 *        schema:
 *          type: object
 *   responses:
 *     200:
 *       description: Amendment created successfully
 *     400:
 *       description: Invalid Facility Id
 *     404:
 *       description: Facility not found
 *     500:
 *       description: Internal Server Error
 */
router
  .route('/facilities/:facilityId/amendments')
  .put(
    validatePortalFacilityAmendmentsEnabled,
    validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }),
    mongoIdValidation('facilityId'),
    handleExpressValidatorResult,
    validatePutPortalFacilityAmendmentPayload,
    putAmendment,
  );

/**
 * @openapi
 * /deals/:dealId/all-types-amendments:
 *  get:
 *    summary: Get all amendments for a deal
 *    tags: [Facility Amendments]
 *    parameters:
 *      - in: path
 *        name: dealId
 *        required: true
 *        description: The ID of the deal to get amendments for
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: Successfully retrieved all amendments for the deal
 *      404:
 *        description: Deal not found
 *      500:
 *        description: Internal Server Error
 */
router.route('/deals/:dealId/all-types-amendments').all(mongoIdValidation('dealId'), handleExpressValidatorResult).get(getFacilityAmendmentsOnDeal);

/**
 * @openapi
 * /deals/:dealId/amendments:
 *  get:
 *    summary: Get all portal amendments for a deal
 *    tags: [Facility Amendments]
 *    parameters:
 *      - in: path
 *        name: dealId
 *        required: true
 *        description: The ID of the deal to get amendments for
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: Successfully retrieved all portal amendments for the deal
 *      404:
 *        description: Deal not found
 *      500:
 *        description: Internal Server Error
 */
router.route('/deals/:dealId/amendments').all(mongoIdValidation('dealId'), handleExpressValidatorResult).get(getPortalFacilityAmendmentsOnDeal);

module.exports = router;
