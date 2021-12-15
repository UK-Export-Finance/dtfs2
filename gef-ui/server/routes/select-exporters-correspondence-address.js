const express = require('express');
const {
  selectExportersCorrespondenceAddress,
  validateSelectExportersCorrespondenceAddress,
} = require('../controllers/select-exporters-correspondence-address');
const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.get('/application-details/:dealId/select-exporters-correspondence-address', validateToken, (req, res) => selectExportersCorrespondenceAddress(req, res));
router.post('/application-details/:dealId/select-exporters-correspondence-address', validateToken, (req, res) => validateSelectExportersCorrespondenceAddress(req, res));

module.exports = router;
