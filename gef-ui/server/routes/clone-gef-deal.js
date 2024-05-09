const express = require('express');
const { validateRole, validateToken, validateBank } = require('../middleware');
const { getMandatoryCriteria } = require('../controllers/mandatory-criteria');
const { cloneDealValidateMandatoryCriteria, cloneDealNameApplication, cloneDealCreateApplication } = require('../controllers/clone-gef-deal');
const { MAKER } = require('../constants/roles');

const router = express.Router();

router.get('/application-details/:dealId/clone', [validateToken, validateBank, validateRole({ role: [MAKER] })], getMandatoryCriteria);
router.post('/application-details/:dealId/clone', [validateToken, validateBank, validateRole({ role: [MAKER] })], cloneDealValidateMandatoryCriteria);
router.get('/application-details/:dealId/clone/name-application', [validateToken, validateBank, validateRole({ role: [MAKER] })], cloneDealNameApplication);
router.post('/application-details/:dealId/clone/name-application', [validateToken, validateBank, validateRole({ role: [MAKER] })], cloneDealCreateApplication);

module.exports = router;
