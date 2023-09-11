const express = require('express');
const { MAKER, CHECKER, ADMIN, DATA_ADMIN, EDITOR, READ_ONLY } = require('../roles/roles');
const { validateUserHasSufficientRole } = require('../roles/validate-user-has-sufficient-role');

const fileUpload = require('../middleware/file-upload');

const application = require('./controllers/application.controller');
const cloneApplication = require('./controllers/clone-gef-deal.controller');
const facilities = require('./controllers/facilities.controller');
const mandatoryCriteriaVersioned = require('./controllers/mandatoryCriteriaVersioned.controller');
const eligibilityCriteria = require('./controllers/eligibilityCriteria.controller');
const externalApi = require('./controllers/externalApi.controller');
const files = require('./controllers/files.controller');

const router = express.Router();

// Application
router
  .route('/application')
  .get(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER, CHECKER, READ_ONLY, DATA_ADMIN, ADMIN] }), application.getAll)
  .post(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER, DATA_ADMIN] }), application.create);

router.route('/application/clone').post(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER] }), cloneApplication.clone);

router
  .route('/application/:id')
  .get(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER, CHECKER, READ_ONLY, DATA_ADMIN, ADMIN] }), application.getById)
  .put(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER, CHECKER, DATA_ADMIN] }), application.update) // checker can add a comment
  .delete(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER, DATA_ADMIN] }), application.delete);

router.route('/application/supporting-information/:id').put(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER, CHECKER, DATA_ADMIN] }), application.updateSupportingInformation);

router
  .route('/application/status/:id')
  .get(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER, CHECKER, READ_ONLY, DATA_ADMIN, ADMIN] }), application.getStatus)
  .put(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER, CHECKER, DATA_ADMIN] }), application.changeStatus);

// Facilities
router
  .route('/facilities')
  .get(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER, CHECKER, READ_ONLY, DATA_ADMIN, ADMIN] }), facilities.getAllGET)
  .post(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER, DATA_ADMIN] }), facilities.create)
  .delete(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER, DATA_ADMIN] }), facilities.deleteByDealId);

router
  .route('/facilities/:id')
  .get(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER, CHECKER, READ_ONLY, DATA_ADMIN, ADMIN] }), facilities.getById)
  .put(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER, DATA_ADMIN] }), facilities.updatePUT)
  .delete(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER, DATA_ADMIN] }), facilities.delete);

// Eligibility Criteria
router
  .route('/eligibility-criteria')
  .get(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER, CHECKER, READ_ONLY, EDITOR, DATA_ADMIN, ADMIN] }), eligibilityCriteria.getAll)
  .post(validateUserHasSufficientRole({ allowedNonAdminRoles: [EDITOR, DATA_ADMIN] }), eligibilityCriteria.create);

router.route('/eligibility-criteria/latest').get(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER, CHECKER, READ_ONLY, EDITOR, DATA_ADMIN, ADMIN] }), eligibilityCriteria.getLatest);

router
  .route('/eligibility-criteria/:version')
  .get(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER, CHECKER, READ_ONLY, EDITOR, DATA_ADMIN, ADMIN] }), eligibilityCriteria.getByVersion)
  .delete(validateUserHasSufficientRole({ allowedNonAdminRoles: [EDITOR, DATA_ADMIN] }), eligibilityCriteria.delete);

// Mandatory Criteria
router
  .route('/mandatory-criteria-versioned')
  .get(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER, CHECKER, READ_ONLY, EDITOR, DATA_ADMIN, ADMIN] }), mandatoryCriteriaVersioned.findAll)
  .post(validateUserHasSufficientRole({ allowedNonAdminRoles: [EDITOR, DATA_ADMIN] }), mandatoryCriteriaVersioned.create);

router
  .route('/mandatory-criteria-versioned/latest')
  .get(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER, CHECKER, READ_ONLY, EDITOR, DATA_ADMIN, ADMIN] }), mandatoryCriteriaVersioned.findLatest);

router
  .route('/mandatory-criteria-versioned/:id')
  .get(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER, CHECKER, READ_ONLY, EDITOR, DATA_ADMIN, ADMIN] }), mandatoryCriteriaVersioned.findOne)
  .put(validateUserHasSufficientRole({ allowedNonAdminRoles: [EDITOR, DATA_ADMIN] }), mandatoryCriteriaVersioned.update)
  .delete(validateUserHasSufficientRole({ allowedNonAdminRoles: [EDITOR, DATA_ADMIN] }), mandatoryCriteriaVersioned.delete);

// File Uploads
// TODO: this feels like it should be a service: https://ukef-dtfs.atlassian.net/browse/DTFS2-4842
router.route('/files').post(
  validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER, DATA_ADMIN] }),
  (req, res, next) => {
    fileUpload(req, res, (error) => {
      if (!error) {
        return next();
      }
      console.error('Unable to upload file %s', error);
      return res.status(400).json({ status: 400, data: 'Failed to upload file' });
    });
  },
  files.create,
);

router
  .route('/files/:id')
  .get(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER, CHECKER, READ_ONLY, EDITOR, DATA_ADMIN, ADMIN] }), files.getById)
  .delete(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER, DATA_ADMIN] }), files.delete);

router.route('/files/:id/download').get(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER, CHECKER, READ_ONLY, EDITOR, DATA_ADMIN, ADMIN] }), files.downloadFile);

router
  .route('/company/:number') // Companies House
  .get(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER, READ_ONLY, DATA_ADMIN, ADMIN] }), externalApi.getByRegistrationNumber);

router
  .route('/address/:postcode') // Ordnance Survey
  .get(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER, READ_ONLY, DATA_ADMIN, ADMIN] }), externalApi.getAddressesByPostcode);

module.exports = router;
