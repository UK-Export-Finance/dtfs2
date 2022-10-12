const express = require('express');
const { validate } = require('../../role-validator');

const fileUpload = require('./middleware/fileUpload');

const application = require('./controllers/application.controller');
const cloneApplication = require('./controllers/clone-gef-deal.controller');
const facilities = require('./controllers/facilities.controller');
const mandatoryCriteria = require('../controllers/mandatoryCriteria.controller');
const eligibilityCriteria = require('./controllers/eligibilityCriteria.controller');
const externalApi = require('./controllers/externalApi.controller');
const files = require('./controllers/files.controller');

const router = express.Router();

// Application
router.route('/application')
  .get(validate({ role: ['maker', 'checker', 'data-admin', 'admin'] }), application.getAll)
  .post(validate({ role: ['maker', 'data-admin'] }), application.create);

router.route('/application/clone').post(validate({ role: ['maker'] }), cloneApplication.clone);

router.route('/application/:id')
  .get(validate({ role: ['maker', 'checker', 'data-admin', 'admin'] }), application.getById)
  .put(validate({ role: ['maker', 'checker', 'data-admin'] }), application.update) // checker can add a comment
  .delete(validate({ role: ['maker', 'data-admin'] }), application.delete);

router.route('/application/supporting-information/:id')
  .put(validate({ role: ['maker', 'checker', 'data-admin'] }), application.updateSupportingInformation);

router.route('/application/status/:id')
  .get(validate({ role: ['maker', 'checker', 'data-admin', 'admin'] }), application.getStatus)
  .put(validate({ role: ['maker', 'checker', 'data-admin'] }), application.changeStatus);

// Facilities
router.route('/facilities')
  .get(validate({ role: ['maker', 'checker', 'data-admin', 'admin'] }), facilities.getAllGET)
  .post(validate({ role: ['maker', 'data-admin'] }), facilities.create)
  .delete(validate({ role: ['maker', 'data-admin'] }), facilities.deleteByDealId);

router.route('/facilities/:id')
  .get(validate({ role: ['maker', 'checker', 'data-admin', 'admin'] }), facilities.getById)
  .put(validate({ role: ['maker', 'data-admin'] }), facilities.updatePUT)
  .delete(validate({ role: ['maker', 'data-admin'] }), facilities.delete);

// Eligibility Criteria
router.route('/eligibility-criteria')
  .get(validate({ role: ['maker', 'checker', 'editor', 'data-admin', 'admin'] }), eligibilityCriteria.getAll)
  .post(validate({ role: ['editor', 'data-admin'] }), eligibilityCriteria.create);

router.route('/eligibility-criteria/latest')
  .get(validate({ role: ['maker', 'checker', 'editor', 'data-admin', 'admin'] }), eligibilityCriteria.getLatest);

router.route('/eligibility-criteria/:version')
  .get(validate({ role: ['maker', 'checker', 'editor', 'data-admin', 'admin'] }), eligibilityCriteria.getByVersion)
  // .put(validate({ role: ['editor', 'data-admin'] }), eligibilityCriteria.update)
  .delete(validate({ role: ['editor', 'data-admin'] }), eligibilityCriteria.delete);

// Mandatory Criteria
router.route('/mandatory-criteria-versioned')
  .get(validate({ role: ['maker', 'checker', 'editor', 'data-admin', 'admin'] }), mandatoryCriteria.findAllMandatoryCriteria)
  .post(validate({ role: ['editor', 'data-admin'] }), mandatoryCriteria.postMandatoryCriteria);

router.route('/mandatory-criteria-versioned/latest')
  .get(validate({ role: ['maker', 'checker', 'editor', 'data-admin', 'admin'] }), mandatoryCriteria.findLatestMandatoryCriteria);

router.route('/mandatory-criteria-versioned/:id')
  .get(validate({ role: ['maker', 'checker', 'editor', 'data-admin', 'admin'] }), mandatoryCriteria.findOneMandatoryCriteria)
  .put(validate({ role: ['editor', 'data-admin'] }), mandatoryCriteria.putMandatoryCriteria)
  .delete(validate({ role: ['editor', 'data-admin'] }), mandatoryCriteria.deleteMandatoryCriteria);

// File Uploads
// TODO: this feels like it should be a service: https://ukef-dtfs.atlassian.net/browse/DTFS2-4842
router.route('/files')
  .post(
    validate({ role: ['maker', 'data-admin'] }),
    fileUpload.any(),
    files.create,
  );

router.route('/files/:id')
  .get(validate({ role: ['maker', 'checker', 'editor', 'data-admin', 'admin'] }), files.getById)
  .delete(validate({ role: ['maker', 'data-admin'] }), files.delete);

router.route('/files/:id/download')
  .get(validate({ role: ['maker', 'checker', 'editor', 'data-admin', 'admin'] }), files.downloadFile);

// 3rd Party
router.route('/company/:number') // companies house
  .get(validate({ role: ['maker', 'data-admin', 'admin'] }), externalApi.getByRegistrationNumber);

router.route('/address/:postcode') // ordnancesurvey
  .get(validate({ role: ['maker', 'data-admin', 'admin'] }), externalApi.getAddressesByPostcode);

module.exports = router;
