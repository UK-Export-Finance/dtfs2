const express = require('express');
const { getSecurityDetails, postSecurityDetails } = require('../controllers/supporting-information/security-details');
const { validateRole, validateToken, validateBank } = require('../middleware');

const router = express.Router();

router.get(
  '/application-details/:dealId/supporting-information/security-details',
  [validateToken, validateBank, validateRole({ role: ['maker'] })],
  (req, res) => getSecurityDetails(req, res),
);
router.post(
  '/application-details/:dealId/supporting-information/security-details',
  [validateToken, validateBank, validateRole({ role: ['maker'] })],
  (req, res) => postSecurityDetails(req, res),
);

module.exports = router;
