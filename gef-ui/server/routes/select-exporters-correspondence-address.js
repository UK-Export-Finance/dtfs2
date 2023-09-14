const express = require('express');
const { selectExportersCorrespondenceAddress, validateSelectExportersCorrespondenceAddress } = require('../controllers/select-exporters-correspondence-address');
const { validateRole, validateToken, validateBank } = require('../middleware');
const { MAKER } = require('../constants/roles');

const router = express.Router();

router.get(
  '/application-details/:dealId/select-exporters-correspondence-address',
  [validateToken, validateBank, validateRole({ role: [MAKER] })],
  (req, res) => selectExportersCorrespondenceAddress(req, res),
);
router.post(
  '/application-details/:dealId/select-exporters-correspondence-address',
  [validateToken, validateBank, validateRole({ role: [MAKER] })],
  (req, res) => validateSelectExportersCorrespondenceAddress(req, res),
);

module.exports = router;
