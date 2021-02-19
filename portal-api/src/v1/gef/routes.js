const express = require('express');
const { validate } = require('../../role-validator');
const mandatoryCriteriaVersioned = require('./controllers/mandatoryCriteriaVersioned.controller');
const application = require('./controllers/application.controller');

const router = express.Router();

// Application
router.route('/application')
  .get(application.getAll)
  .post(validate({ role: ['maker'] }), application.create);

router.route('/application/:id')
  .get(application.getById)
  .put(validate({ role: ['maker'] }), application.update)
  .delete(validate({ role: ['maker'] }), application.delete);

// Mandatory Criteria
router.route('/mandatory-criteria-versioned')
  .get(mandatoryCriteriaVersioned.findAll)
  .post(validate({ role: ['editor'] }), mandatoryCriteriaVersioned.create);

router.route('/mandatory-criteria-versioned/latest')
  .get(mandatoryCriteriaVersioned.findLatest);

router.route('/mandatory-criteria-versioned/:id')
  .get(mandatoryCriteriaVersioned.findOne)
  .put(validate({ role: ['editor'] }), mandatoryCriteriaVersioned.update)
  .delete(validate({ role: ['editor'] }), mandatoryCriteriaVersioned.delete);

module.exports = router;
