const express = require('express');
const { nameApplication, createApplication, updateApplicationReferences } = require('../controllers/name-application');
const { validateRole, validateToken, validateBank } = require('../middleware');

const router = express.Router();

router.get('/name-application', [validateToken, validateBank, validateRole({ role: ['maker'] })], (req, res) => nameApplication(req, res));
router.post('/name-application', [validateToken, validateBank, validateRole({ role: ['maker'] })], (req, res) => createApplication(req, res));
router.get('/applications/:id/name', [validateToken, validateBank, validateRole({ role: ['maker'] })], nameApplication);
router.post('/applications/:id/name', [validateToken, validateBank, validateRole({ role: ['maker'] })], updateApplicationReferences);

module.exports = router;
