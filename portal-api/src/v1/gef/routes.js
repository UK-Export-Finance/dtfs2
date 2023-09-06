const express = require('express');
const { validate } = require('../../role-validator');

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
  .get(validate({ role: ['maker', 'checker', 'data-admin', 'admin'] }), application.getAll)
  .post(validate({ role: ['maker', 'data-admin'] }), application.create);

router.route('/application/clone').post(validate({ role: ['maker'] }), cloneApplication.clone);

router
  .route('/application/:id')
  .get(validate({ role: ['maker', 'checker', 'data-admin', 'admin'] }), application.getById)
  .put(validate({ role: ['maker', 'checker', 'data-admin'] }), application.update) // checker can add a comment
  .delete(validate({ role: ['maker', 'data-admin'] }), application.delete);

router.route('/application/supporting-information/:id').put(validate({ role: ['maker', 'checker', 'data-admin'] }), application.updateSupportingInformation);

router
  .route('/application/status/:id')
  .get(validate({ role: ['maker', 'checker', 'data-admin', 'admin'] }), application.getStatus)
  .put(validate({ role: ['maker', 'checker', 'data-admin'] }), application.changeStatus);

// Facilities
router
  .route('/facilities')
  .get(validate({ role: ['maker', 'checker', 'data-admin', 'admin'] }), facilities.getAllGET)
  .post(validate({ role: ['maker', 'data-admin'] }), facilities.create)
  .delete(validate({ role: ['maker', 'data-admin'] }), facilities.deleteByDealId);

router
  .route('/facilities/:id')
  .get(validate({ role: ['maker', 'checker', 'data-admin', 'admin'] }), facilities.getById)
  .put(validate({ role: ['maker', 'data-admin'] }), facilities.updatePUT)
  .delete(validate({ role: ['maker', 'data-admin'] }), facilities.delete);

// Eligibility Criteria
router
  .route('/eligibility-criteria')
  .get(validate({ role: ['maker', 'checker', 'editor', 'data-admin', 'admin'] }), eligibilityCriteria.getAll)
  .post(validate({ role: ['editor', 'data-admin'] }), eligibilityCriteria.create);

router.route('/eligibility-criteria/latest').get(validate({ role: ['maker', 'checker', 'editor', 'data-admin', 'admin'] }), eligibilityCriteria.getLatest);

router
  .route('/eligibility-criteria/:version')
  .get(validate({ role: ['maker', 'checker', 'editor', 'data-admin', 'admin'] }), eligibilityCriteria.getByVersion)
  .delete(validate({ role: ['editor', 'data-admin'] }), eligibilityCriteria.delete);

// Mandatory Criteria
router
  .route('/mandatory-criteria-versioned')
  .get(validate({ role: ['maker', 'checker', 'editor', 'data-admin', 'admin'] }), mandatoryCriteriaVersioned.findAll)
  .post(validate({ role: ['editor', 'data-admin'] }), mandatoryCriteriaVersioned.create);

router
  .route('/mandatory-criteria-versioned/latest')
  .get(validate({ role: ['maker', 'checker', 'editor', 'data-admin', 'admin'] }), mandatoryCriteriaVersioned.findLatest);

router
  .route('/mandatory-criteria-versioned/:id')
  .get(validate({ role: ['maker', 'checker', 'editor', 'data-admin', 'admin'] }), mandatoryCriteriaVersioned.findOne)
  .put(validate({ role: ['editor', 'data-admin'] }), mandatoryCriteriaVersioned.update)
  .delete(validate({ role: ['editor', 'data-admin'] }), mandatoryCriteriaVersioned.delete);

// File Uploads
// TODO: this feels like it should be a service: https://ukef-dtfs.atlassian.net/browse/DTFS2-4842
router.route('/files').post(
  validate({ role: ['maker', 'data-admin'] }),
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
  .get(validate({ role: ['maker', 'checker', 'editor', 'data-admin', 'admin'] }), files.getById)
  .delete(validate({ role: ['maker', 'data-admin'] }), files.delete);

router.route('/files/:id/download').get(validate({ role: ['maker', 'checker', 'editor', 'data-admin', 'admin'] }), files.downloadFile);

router
  .route('/company/:number') // Companies House
  .get(validate({ role: ['maker', 'data-admin', 'admin'] }), externalApi.getByRegistrationNumber);

router
  .route('/address/:postcode') // Ordnance Survey
  .get(validate({ role: ['maker', 'data-admin', 'admin'] }), externalApi.getAddressesByPostcode);

module.exports = router;
