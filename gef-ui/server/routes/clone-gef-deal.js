const express = require('express');
const { validateRole, validateToken, validateBank } = require('../middleware');
const { getMandatoryCriteria } = require('../controllers/mandatory-criteria');
const { cloneDealValidateMandatoryCriteria, cloneDealNameApplication, cloneDealCreateApplication } = require('../controllers/clone-gef-deal');

const router = express.Router();

router.get('/application-details/:dealId/clone', [validateToken, validateBank, validateRole({ role: ['maker'] })], getMandatoryCriteria);
router.post('/application-details/:dealId/clone', [validateToken, validateBank, validateRole({ role: ['maker'] })], cloneDealValidateMandatoryCriteria);
router.get('/application-details/:dealId/clone/name-application', [validateToken, validateBank, validateRole({ role: ['maker'] })], cloneDealNameApplication);
router.post('/application-details/:dealId/clone/name-application', [validateToken, validateBank, validateRole({ role: ['maker'] })], cloneDealCreateApplication);

module.exports = router;
