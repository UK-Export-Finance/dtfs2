const express = require('express');
const { validate } = require('../../role-validator');

const application = require('./controllers/application.controller');
const exporter = require('./controllers/exporter.controller');
const mandatoryCriteriaVersioned = require('./controllers/mandatoryCriteriaVersioned.controller');

const router = express.Router();

// Application
router.route('/application')
  .get(validate({ role: ['checker'] }), application.getAll)
  .post(validate({ role: ['maker'] }), application.create);

router.route('/application/:id')
  .get(validate({ role: ['maker', 'checker'] }), application.getById)
  .put(validate({ role: ['maker'] }), application.update)
  .delete(validate({ role: ['maker'] }), application.delete);

// Exporter
router.route('/exporter/:id')
  .get(validate({ role: ['maker', 'checker'] }), exporter.getById)
  .put(validate({ role: ['maker'] }), exporter.update);

// Mandatory Criteria
router.route('/mandatory-criteria-versioned')
  .get(validate({ role: ['maker', 'checker', 'editor'] }), mandatoryCriteriaVersioned.findAll)
  .post(validate({ role: ['editor'] }), mandatoryCriteriaVersioned.create);

router.route('/mandatory-criteria-versioned/latest')
  .get(validate({ role: ['maker', 'checker', 'editor'] }), mandatoryCriteriaVersioned.findLatest);

router.route('/mandatory-criteria-versioned/:id')
  .get(validate({ role: ['maker', 'checker', 'editor'] }), mandatoryCriteriaVersioned.findOne)
  .put(validate({ role: ['editor'] }), mandatoryCriteriaVersioned.update)
  .delete(validate({ role: ['editor'] }), mandatoryCriteriaVersioned.delete);

module.exports = router;
