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

const router = express.Router();

// Application
router
  .route('/application')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), application.getAll)
  .post(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), application.create);

router.route('/application/clone').post(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), cloneApplication.clone);

router
  .route('/application/:id')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), application.getById)
  .put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER] }), application.update) // checker can add a comment
  .delete(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), application.delete);

router
  .route('/application/supporting-information/:id')
  .put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER] }), application.updateSupportingInformation);

router
  .route('/application/status/:id')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), application.getStatus)
  .put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER] }), application.changeStatus);

// Facilities
router
  .route('/facilities')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), facilities.getFacilitiesByDealId)
  .post(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), facilities.create)
  .delete(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), facilities.deleteByDealId);

router
  .route('/facilities/amendments')
  .all(validatePortalFacilityAmendmentsEnabled, validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER] }), handleExpressValidatorResult)
  .get(getAllFacilityAmendments);

router
  .route('/facilities/:id')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), facilities.getById)
  .put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), facilities.updatePUT)
  .delete(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), facilities.delete);

// Eligibility Criteria
router
  .route('/eligibility-criteria')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), eligibilityCriteria.getAll)
  .post(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [ADMIN] }), eligibilityCriteria.create);

router
  .route('/eligibility-criteria/latest')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), eligibilityCriteria.getLatest);

router
  .route('/eligibility-criteria/:version')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), eligibilityCriteria.getByVersion)
  .delete(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [ADMIN] }), eligibilityCriteria.delete);

// Mandatory Criteria
router
  .route('/mandatory-criteria-versioned')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), mandatoryCriteriaVersioned.findAll);

router
  .route('/mandatory-criteria-versioned/latest')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), mandatoryCriteriaVersioned.findLatest);

router
  .route('/mandatory-criteria-versioned/:id')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), mandatoryCriteriaVersioned.findOne)
  .delete(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [ADMIN] }), mandatoryCriteriaVersioned.delete);

// File Uploads
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

router
  .route('/files/:id')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), files.getById)
  .delete(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), files.delete);

router.route('/files/:id/download').get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), files.downloadFile);

router.route('/companies/:registrationNumber').get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), companies.getCompanyByRegistrationNumber);

router
  .route('/address/:postcode') // Geospatial Addresses
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, READ_ONLY, ADMIN] }), externalApi.getAddressesByPostcode);

router
  .route('/facilities/:facilityId/amendments/:amendmentId')
  .all(validatePortalFacilityAmendmentsEnabled, mongoIdValidation('facilityId'), mongoIdValidation('amendmentId'), handleExpressValidatorResult)
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER] }), getAmendment)
  .patch(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), validatePatchPortalFacilityAmendmentPayload, patchAmendment)
  .delete(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), validateDeletePortalFacilityAmendmentPayload, deleteAmendment);

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

router.route('/deals/:dealId/all-types-amendments').all(mongoIdValidation('dealId'), handleExpressValidatorResult).get(getFacilityAmendmentsOnDeal);

router.route('/deals/:dealId/amendments').all(mongoIdValidation('dealId'), handleExpressValidatorResult).get(getPortalFacilityAmendmentsOnDeal);

module.exports = router;
