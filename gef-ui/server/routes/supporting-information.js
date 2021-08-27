const express = require('express');
const {
  getSecurityDetails,
  postSecurityDetails,
} = require('../controllers/supporting-information');
const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.get('/application-details/:applicationId/supporting-information/security-details', validateToken, getSecurityDetails);
router.post('/application-details/:applicationId/supporting-information/security-details', validateToken, postSecurityDetails);

module.exports = router;
