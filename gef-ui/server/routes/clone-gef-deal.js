const express = require('express');
const validateToken = require('../middleware/validateToken');
const { cloneDealMandatoryCriteria, cloneDealPostMandatoryCriteria, cloneDealNameApplication } = require('../controllers/clone-gef-deal');

const router = express.Router();

router.get('/application-details/:applicationId/clone/', validateToken, cloneDealMandatoryCriteria);
router.get('/application-details/:applicationId/clone/', validateToken, cloneDealNameApplication);
router.post('/application-details/:applicationId/clone/name-application', validateToken, cloneDealPostMandatoryCriteria);

module.exports = router;
