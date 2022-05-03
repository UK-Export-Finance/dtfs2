const express = require('express');
const {
  enterExportersCorrespondenceAddress,
  validateEnterExportersCorrespondenceAddress,
} = require('../controllers/enter-exporters-correspondence-address');
const { validateRole, validateToken, validateBank } = require('../middleware');

const router = express.Router();

router.get(
  '/application-details/:dealId/enter-exporters-correspondence-address',
  [validateToken, validateBank, validateRole({ role: ['maker'] })],
  (req, res) => enterExportersCorrespondenceAddress(req, res),
);
router.post('/application-details/:dealId/enter-exporters-correspondence-address', [validateToken, validateBank, validateRole({ role: ['maker'] })], (req, res) => validateEnterExportersCorrespondenceAddress(req, res));

module.exports = router;
