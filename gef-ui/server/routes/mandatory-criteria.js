const express = require('express');
const {
  getMandatoryCriteria,
  validateMandatoryCriteria,
} = require('../controllers/mandatory-criteria');
const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.get('/mandatory-criteria', validateToken, (req, res) => getMandatoryCriteria(req, res));
router.post('/mandatory-criteria', validateToken, (req, res) => validateMandatoryCriteria(req, res));

module.exports = router;
