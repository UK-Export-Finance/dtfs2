const express = require('express');
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
  .get(validateUserHasSufficientRole({ allowedRoles: ['maker', 'checker', 'data-admin', 'admin'] }), application.getAll)
  .post(validateUserHasSufficientRole({ allowedRoles: ['maker', 'data-admin'] }), application.create);

router.route('/application/clone').post(validateUserHasSufficientRole({ allowedRoles: ['maker'] }), cloneApplication.clone);

router
  .route('/application/:id')
  .get(validateUserHasSufficientRole({ allowedRoles: ['maker', 'checker', 'data-admin', 'admin'] }), application.getById)
  .put(validateUserHasSufficientRole({ allowedRoles: ['maker', 'checker', 'data-admin'] }), application.update) // checker can add a comment
  .delete(validateUserHasSufficientRole({ allowedRoles: ['maker', 'data-admin'] }), application.delete);

router.route('/application/supporting-information/:id').put(validateUserHasSufficientRole({ allowedRoles: ['maker', 'checker', 'data-admin'] }), application.updateSupportingInformation);

router
  .route('/application/status/:id')
  .get(validateUserHasSufficientRole({ allowedRoles: ['maker', 'checker', 'data-admin', 'admin'] }), application.getStatus)
  .put(validateUserHasSufficientRole({ allowedRoles: ['maker', 'checker', 'data-admin'] }), application.changeStatus);

// Facilities
router
  .route('/facilities')
  .get(validateUserHasSufficientRole({ allowedRoles: ['maker', 'checker', 'data-admin', 'admin'] }), facilities.getAllGET)
  .post(validateUserHasSufficientRole({ allowedRoles: ['maker', 'data-admin'] }), facilities.create)
  .delete(validateUserHasSufficientRole({ allowedRoles: ['maker', 'data-admin'] }), facilities.deleteByDealId);

router
  .route('/facilities/:id')
  .get(validateUserHasSufficientRole({ allowedRoles: ['maker', 'checker', 'data-admin', 'admin'] }), facilities.getById)
  .put(validateUserHasSufficientRole({ allowedRoles: ['maker', 'data-admin'] }), facilities.updatePUT)
  .delete(validateUserHasSufficientRole({ allowedRoles: ['maker', 'data-admin'] }), facilities.delete);

// Eligibility Criteria
router
  .route('/eligibility-criteria')
  .get(validateUserHasSufficientRole({ allowedRoles: ['maker', 'checker', 'editor', 'data-admin', 'admin'] }), eligibilityCriteria.getAll)
  .post(validateUserHasSufficientRole({ allowedRoles: ['editor', 'data-admin'] }), eligibilityCriteria.create);

router.route('/eligibility-criteria/latest').get(validateUserHasSufficientRole({ allowedRoles: ['maker', 'checker', 'editor', 'data-admin', 'admin'] }), eligibilityCriteria.getLatest);

router
  .route('/eligibility-criteria/:version')
  .get(validateUserHasSufficientRole({ allowedRoles: ['maker', 'checker', 'editor', 'data-admin', 'admin'] }), eligibilityCriteria.getByVersion)
  .delete(validateUserHasSufficientRole({ allowedRoles: ['editor', 'data-admin'] }), eligibilityCriteria.delete);

// Mandatory Criteria
router
  .route('/mandatory-criteria-versioned')
  .get(validateUserHasSufficientRole({ allowedRoles: ['maker', 'checker', 'editor', 'data-admin', 'admin'] }), mandatoryCriteriaVersioned.findAll)
  .post(validateUserHasSufficientRole({ allowedRoles: ['editor', 'data-admin'] }), mandatoryCriteriaVersioned.create);

router
  .route('/mandatory-criteria-versioned/latest')
  .get(validateUserHasSufficientRole({ allowedRoles: ['maker', 'checker', 'editor', 'data-admin', 'admin'] }), mandatoryCriteriaVersioned.findLatest);

router
  .route('/mandatory-criteria-versioned/:id')
  .get(validateUserHasSufficientRole({ allowedRoles: ['maker', 'checker', 'editor', 'data-admin', 'admin'] }), mandatoryCriteriaVersioned.findOne)
  .put(validateUserHasSufficientRole({ allowedRoles: ['editor', 'data-admin'] }), mandatoryCriteriaVersioned.update)
  .delete(validateUserHasSufficientRole({ allowedRoles: ['editor', 'data-admin'] }), mandatoryCriteriaVersioned.delete);

// File Uploads
// TODO: this feels like it should be a service: https://ukef-dtfs.atlassian.net/browse/DTFS2-4842
router.route('/files').post(
  validateUserHasSufficientRole({ allowedRoles: ['maker', 'data-admin'] }),
  (req, res, next) => {
    fileUpload(req, res, (error) => {
      if (!error) {
        return next();
      }
      console.error('Unable to upload file %O', error);
      return res.status(400).json({ status: 400, data: 'Failed to upload file' });
    });
  },
  files.create,
);

router
  .route('/files/:id')
  .get(validateUserHasSufficientRole({ allowedRoles: ['maker', 'checker', 'editor', 'data-admin', 'admin'] }), files.getById)
  .delete(validateUserHasSufficientRole({ allowedRoles: ['maker', 'data-admin'] }), files.delete);

router.route('/files/:id/download').get(validateUserHasSufficientRole({ allowedRoles: ['maker', 'checker', 'editor', 'data-admin', 'admin'] }), files.downloadFile);

router
  .route('/company/:number') // Companies House
  .get(validateUserHasSufficientRole({ allowedRoles: ['maker', 'data-admin', 'admin'] }), externalApi.getByRegistrationNumber);

router
  .route('/address/:postcode') // Ordnance Survey
  .get(validateUserHasSufficientRole({ allowedRoles: ['maker', 'data-admin', 'admin'] }), externalApi.getAddressesByPostcode);

module.exports = router;
