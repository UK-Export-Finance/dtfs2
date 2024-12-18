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
const { getAmendment } = require('../controllers/amendments/get-amendment.controller');
const { handleExpressValidatorResult } = require('../validation/route-validators/express-validator-result-handler');

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
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), facilities.getAllGET)
  .post(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), facilities.create)
  .delete(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), facilities.deleteByDealId);

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
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), mandatoryCriteriaVersioned.findAll)
  .post(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [ADMIN] }), mandatoryCriteriaVersioned.create);

router
  .route('/mandatory-criteria-versioned/latest')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), mandatoryCriteriaVersioned.findLatest);

router
  .route('/mandatory-criteria-versioned/:id')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), mandatoryCriteriaVersioned.findOne)
  .put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [ADMIN] }), mandatoryCriteriaVersioned.update)
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
  .all(
    validatePortalFacilityAmendmentsEnabled,
    validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }),
    mongoIdValidation('facilityId'),
    mongoIdValidation('amendmentId'),
    handleExpressValidatorResult,
  )
  .get(getAmendment);

module.exports = router;
