const express = require('express');
const {
  applicationDetails,
  postApplicationDetails,
} = require('../controllers/application-details');
const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.get('/application-details/:applicationId', validateToken, (req, res) => applicationDetails(req, res));
router.post('/application-details/:applicationId', validateToken, postApplicationDetails);

module.exports = router;
