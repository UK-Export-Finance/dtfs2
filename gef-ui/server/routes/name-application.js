const express = require('express');
const { nameApplication, createApplication, updateApplicationReferences } = require('../controllers/name-application');
const { validateRole, validateToken, validateBank } = require('../middleware');
const { MAKER } = require('../constants/roles');

const router = express.Router();

router.get('/name-application', [validateToken, validateRole({ role: [MAKER] })], (req, res) => nameApplication(req, res));
router.post('/name-application', [validateToken, validateRole({ role: [MAKER] })], (req, res) => createApplication(req, res));
router.get('/applications/:dealId/name', [validateToken, validateBank, validateRole({ role: [MAKER] })], nameApplication);
router.post('/applications/:dealId/name', [validateToken, validateBank, validateRole({ role: [MAKER] })], updateApplicationReferences);

module.exports = router;
