const express = require('express');
const { getMandatoryCriteria, validateMandatoryCriteria } = require('../controllers/mandatory-criteria');
const { validateRole, validateToken } = require('../middleware');
const { MAKER } = require('../constants/roles');

const router = express.Router();

router.get('/mandatory-criteria', [validateToken, validateRole({ role: [MAKER] })], (req, res) => getMandatoryCriteria(req, res));
router.post('/mandatory-criteria', [validateToken, validateRole({ role: [MAKER] })], (req, res) => validateMandatoryCriteria(req, res));

module.exports = router;
