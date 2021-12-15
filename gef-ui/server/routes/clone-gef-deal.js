const express = require('express');
const validateToken = require('../middleware/validateToken');
const { getMandatoryCriteria } = require('../controllers/mandatory-criteria');
const { cloneDealValidateMandatoryCriteria, cloneDealNameApplication, cloneDealCreateApplication } = require('../controllers/clone-gef-deal');

const router = express.Router();

router.get('/application-details/:dealId/clone', validateToken, getMandatoryCriteria);
router.post('/application-details/:dealId/clone', validateToken, cloneDealValidateMandatoryCriteria);
router.get('/application-details/:dealId/clone/name-application', validateToken, cloneDealNameApplication);
router.post('/application-details/:dealId/clone/name-application', validateToken, cloneDealCreateApplication);

module.exports = router;
