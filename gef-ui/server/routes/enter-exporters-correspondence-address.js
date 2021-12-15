const express = require('express');
const {
  enterExportersCorrespondenceAddress,
  validateEnterExportersCorrespondenceAddress,
} = require('../controllers/enter-exporters-correspondence-address');
const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.get('/application-details/:dealId/enter-exporters-correspondence-address', validateToken, (req, res) => enterExportersCorrespondenceAddress(req, res));
router.post('/application-details/:dealId/enter-exporters-correspondence-address', validateToken, (req, res) => validateEnterExportersCorrespondenceAddress(req, res));

module.exports = router;
