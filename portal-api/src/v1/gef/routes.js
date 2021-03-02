const express = require('express');
const { validate } = require('../../role-validator');

const application = require('./controllers/application.controller');
const exporter = require('./controllers/exporter.controller');
const facilities = require('./controllers/facilities.controller');
const mandatoryCriteriaVersioned = require('./controllers/mandatoryCriteriaVersioned.controller');

const router = express.Router();

// Application
router.route('/application')
  .get(validate({ role: ['checker', 'data-admin'] }), application.getAll)
  .post(validate({ role: ['maker', 'data-admin'] }), application.create);

router.route('/application/:id')
  .get(validate({ role: ['maker', 'checker', 'data-admin'] }), application.getById)
  .put(validate({ role: ['maker', 'data-admin'] }), application.update)
  .delete(validate({ role: ['maker', 'data-admin'] }), application.delete);

// Exporter
router.route('/exporter/:id')
  .get(validate({ role: ['maker', 'checker', 'data-admin'] }), exporter.getById)
  .put(validate({ role: ['maker', 'data-admin'] }), exporter.update);

// Facilities
router.route('/facilities')
  .get(validate({ role: ['maker', 'checker', 'data-admin'] }), facilities.getAll)
  .post(validate({ role: ['maker', 'data-admin'] }), facilities.create)
  .delete(validate({ role: ['maker', 'data-admin'] }), facilities.deleteByApplicationId);

router.route('/facilities/:id')
  .get(validate({ role: ['maker', 'checker', 'data-admin'] }), facilities.getById)
  .put(validate({ role: ['maker', 'data-admin'] }), facilities.update)
  .delete(validate({ role: ['maker', 'data-admin'] }), facilities.delete);

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

module.exports = router;
