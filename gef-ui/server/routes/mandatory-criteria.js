const express = require('express');
const { getMandatoryCriteria, validateMandatoryCriteria } = require('../controllers/mandatory-criteria');
const { validateRole, validateToken, validateBank } = require('../middleware');

const router = express.Router();

router.get(
  '/mandatory-criteria',
  [validateToken, validateBank, validateRole({ role: ['maker'] })],
  (req, res) => getMandatoryCriteria(req, res),
);
router.post(
  '/mandatory-criteria',
  [validateToken, validateBank, validateRole({ role: ['maker'] })],
  (req, res) => validateMandatoryCriteria(req, res),
);

module.exports = router;
