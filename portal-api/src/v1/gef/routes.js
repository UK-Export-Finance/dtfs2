const express = require('express');
const { validate } = require('../../role-validator');
const mandatoryCriteriaVersioned = require('./controllers/mandatoryCriteriaVersioned.controller');

const router = express.Router();

router.route('/mandatory-criteria-versioned')
  .get(
    mandatoryCriteriaVersioned.findAll,
  )
  .post(
    validate({ role: ['editor'] }),
    mandatoryCriteriaVersioned.create,
  );

router.route('/mandatory-criteria-versioned/latest')
  .get(
    mandatoryCriteriaVersioned.findLatest,
  );

router.route('/gef/mandatory-criteria-versioned/:id')
  .get(
    mandatoryCriteriaVersioned.findOne,
  )
  .put(
    validate({ role: ['editor'] }),
    mandatoryCriteriaVersioned.update,
  )
  .delete(
    validate({ role: ['editor'] }),
    mandatoryCriteriaVersioned.delete,
  );

module.exports = router;
