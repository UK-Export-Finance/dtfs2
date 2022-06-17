const express = require('express');
const {
  exportersAddress,
  validateExportersAddress,
} = require('../controllers/exporters-address');
const { validateRole, validateToken, validateBank } = require('../middleware');

const router = express.Router();

router.get(
  '/application-details/:dealId/exporters-address',
  [validateToken, validateBank, validateRole({ role: ['maker'] })],
  (req, res) => exportersAddress(req, res),
);
router.post(
  '/application-details/:dealId/exporters-address',
  [validateToken, validateBank, validateRole({ role: ['maker'] })],
  (req, res) => validateExportersAddress(req, res),
);

module.exports = router;
