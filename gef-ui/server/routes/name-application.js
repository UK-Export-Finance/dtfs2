const express = require('express');
const { nameApplication, createApplication, updateApplicationReferences } = require('../controllers/name-application');
const { validateRole, validateToken } = require('../middleware');

const router = express.Router();

router.get('/name-application', [validateToken, validateRole.validate({ role: ['maker'] })], (req, res) => nameApplication(req, res));
router.post('/name-application', [validateToken, validateRole.validate({ role: ['maker'] })], (req, res) => createApplication(req, res));
router.get('/applications/:id/name', [validateToken, validateRole.validate({ role: ['maker'] })], nameApplication);
router.post('/applications/:id/name', [validateToken, validateRole.validate({ role: ['maker'] })], updateApplicationReferences);

module.exports = router;
