const express = require('express');

const { getSecurityDetails, postSecurityDetails } = require('../controllers/supporting-information/security-details');
const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.get('/application-details/:dealId/supporting-information/security-details', [validateToken], getSecurityDetails);
router.post('/application-details/:dealId/supporting-information/security-details', [validateToken], postSecurityDetails);

module.exports = router;
