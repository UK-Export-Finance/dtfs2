const express = require('express');
const { enterExportersCorrespondenceAddress, validateEnterExportersCorrespondenceAddress } = require('../controllers/enter-exporters-correspondence-address');
const { validateRole, validateToken, validateBank } = require('../middleware');
const { MAKER } = require('../constants/roles');

const router = express.Router();

router.get('/application-details/:dealId/enter-exporters-correspondence-address', [validateToken, validateBank, validateRole({ role: [MAKER] })], (req, res) =>
  enterExportersCorrespondenceAddress(req, res),
);
router.post('/application-details/:dealId/enter-exporters-correspondence-address', [validateToken, validateBank, validateRole({ role: [MAKER] })], (req, res) =>
  validateEnterExportersCorrespondenceAddress(req, res),
);

module.exports = router;
