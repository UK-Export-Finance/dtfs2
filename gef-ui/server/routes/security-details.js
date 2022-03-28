const express = require('express');

const { getSecurityDetails, postSecurityDetails } = require('../controllers/supporting-information/security-details');
const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.get('/application-details/:dealId/supporting-information/security-details', validateToken, (req, res) => getSecurityDetails(req, res));
router.post('/application-details/:dealId/supporting-information/security-details', validateToken, (req, res) => postSecurityDetails(req, res));

module.exports = router;
