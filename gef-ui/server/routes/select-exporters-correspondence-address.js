const express = require('express');
const {
  selectExportersCorrespondenceAddress,
  validateSelectExportersCorrespondenceAddress,
} = require('../controllers/select-exporters-correspondence-address');
const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.get('/application-details/:applicationId/select-exporters-correspondence-address', validateToken, (req, res) => selectExportersCorrespondenceAddress(req, res));
router.post('/application-details/:applicationId/select-exporters-correspondence-address', validateToken, (req, res) => validateSelectExportersCorrespondenceAddress(req, res));

module.exports = router;
