const express = require('express');
const validateToken = require('../middleware/validateToken');
const { validateBank, validateRole } = require('../middleware');
const { getMandatoryCriteria } = require('../controllers/mandatory-criteria');
const { cloneDealValidateMandatoryCriteria, cloneDealNameApplication, cloneDealCreateApplication } = require('../controllers/clone-gef-deal');

const router = express.Router();

router.get('/application-details/:dealId/clone', [validateToken, validateRole.validate({ role: ['maker'] })], getMandatoryCriteria);
router.post('/application-details/:dealId/clone', [validateToken, validateRole.validate({ role: ['maker'] })], cloneDealValidateMandatoryCriteria);
router.get('/application-details/:dealId/clone/name-application', [validateToken, validateRole.validate({ role: ['maker'] })], cloneDealNameApplication);
router.post('/application-details/:dealId/clone/name-application', [validateToken, validateRole.validate({ role: ['maker'] })], cloneDealCreateApplication);

module.exports = router;
