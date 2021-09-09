const express = require('express');
const {
  exportersAddress,
  validateExportersAddress,
} = require('../controllers/exporters-address');
const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.get('/application-details/:applicationId/exporters-address', validateToken, (req, res) => exportersAddress(req, res));
router.post('/application-details/:applicationId/exporters-address', validateToken, (req, res) => validateExportersAddress(req, res));

module.exports = router;
