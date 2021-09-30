const express = require('express');
const { validate } = require('../../role-validator');

const fileUpload = require('./middleware/fileUpload');

const application = require('./controllers/application.controller');
const exporter = require('./controllers/exporter.controller');
const facilities = require('./controllers/facilities.controller');
const coverTerms = require('./controllers/coverTerms.controller');
const mandatoryCriteriaVersioned = require('./controllers/mandatoryCriteriaVersioned.controller');
const eligibilityCriteria = require('./controllers/eligibilityCriteria.controller');
const externalApi = require('./controllers/externalApi.controller');
const files = require('./controllers/files.controller');

const router = express.Router();

// Application
router.route('/application')
  .get(validate({ role: ['maker', 'checker', 'data-admin'] }), application.getAll)
  .post(validate({ role: ['maker', 'data-admin'] }), application.create);

router.route('/application/:id')
  .get(validate({ role: ['maker', 'checker', 'data-admin'] }), application.getById)
  .put(validate({ role: ['maker', 'checker', 'data-admin'] }), application.update) // checker can add a comment
  .delete(validate({ role: ['maker', 'data-admin'] }), application.delete);

router.route('/application/status/:id')
  .get(validate({ role: ['maker', 'checker', 'data-admin'] }), application.getStatus)
  .put(validate({ role: ['maker', 'checker', 'data-admin'] }), application.changeStatus);

// Exporter
router.route('/exporter/:id')
  .get(validate({ role: ['maker', 'checker', 'data-admin'] }), exporter.getById)
  .put(validate({ role: ['maker', 'data-admin'] }), exporter.update);

// Cover Terms
router.route('/cover-terms/:id')
  .get(validate({ role: ['maker', 'checker', 'data-admin'] }), coverTerms.getById)
  .put(validate({ role: ['maker', 'data-admin'] }), coverTerms.update);

// Facilities
router.route('/facilities')
  .get(validate({ role: ['maker', 'checker', 'data-admin'] }), facilities.getAllGET)
  .post(validate({ role: ['maker', 'data-admin'] }), facilities.create)
  .delete(validate({ role: ['maker', 'data-admin'] }), facilities.deleteByApplicationId);

router.route('/facilities/:id')
  .get(validate({ role: ['maker', 'checker', 'data-admin'] }), facilities.getById)
  .put(validate({ role: ['maker', 'data-admin'] }), facilities.updatePUT)
  .delete(validate({ role: ['maker', 'data-admin'] }), facilities.delete);

// Eligibility Criteria
router.route('/eligibility-criteria')
  .get(validate({ role: ['maker', 'checker', 'editor', 'data-admin'] }), eligibilityCriteria.getAll)
  .post(validate({ role: ['editor', 'data-admin'] }), eligibilityCriteria.create);

router.route('/eligibility-criteria/latest')
  .get(validate({ role: ['maker', 'checker', 'editor', 'data-admin'] }), eligibilityCriteria.getLatest);

router.route('/eligibility-criteria/:id')
  .get(validate({ role: ['maker', 'checker', 'editor', 'data-admin'] }), eligibilityCriteria.getById)
  // .put(validate({ role: ['editor', 'data-admin'] }), eligibilityCriteria.update)
  .delete(validate({ role: ['editor', 'data-admin'] }), eligibilityCriteria.delete);

// Mandatory Criteria
router.route('/mandatory-criteria-versioned')
  .get(validate({ role: ['maker', 'checker', 'editor', 'data-admin'] }), mandatoryCriteriaVersioned.findAll)
  .post(validate({ role: ['editor', 'data-admin'] }), mandatoryCriteriaVersioned.create);

router.route('/mandatory-criteria-versioned/latest')
  .get(validate({ role: ['maker', 'checker', 'editor', 'data-admin'] }), mandatoryCriteriaVersioned.findLatest);

router.route('/mandatory-criteria-versioned/:id')
  .get(validate({ role: ['maker', 'checker', 'editor', 'data-admin'] }), mandatoryCriteriaVersioned.findOne)
  .put(validate({ role: ['editor', 'data-admin'] }), mandatoryCriteriaVersioned.update)
  .delete(validate({ role: ['editor', 'data-admin'] }), mandatoryCriteriaVersioned.delete);

// File Uploads
// TODO: this feels like it should be a service: https://ukef-dtfs.atlassian.net/browse/DTFS2-4842
router.route('/files')
  .post(
    validate({ role: ['maker', 'data-admin'] }),
    fileUpload.any(),
    files.create,
  );

router.route('/files/:id')
  .get(validate({ role: ['maker', 'checker', 'editor', 'data-admin'] }), files.getById)
  .delete(validate({ role: ['maker', 'data-admin'] }), files.delete);

router.route('/files/:id/download')
  .get(validate({ role: ['maker', 'checker', 'editor', 'data-admin'] }), files.downloadFile);

// 3rd Party
router.route('/company/:number') // companies house
  .get(validate({ role: ['maker', 'data-admin'] }), externalApi.getByRegistrationNumber);

router.route('/address/:postcode') // ordnancesurvey
  .get(validate({ role: ['maker', 'data-admin'] }), externalApi.getAddressesByPostcode);

module.exports = router;
