const express = require('express');
const { facilityConfirmDeletion, deleteFacility } = require('../controllers/facility-confirm-deletion');
const { validateRole, validateToken, validateBank } = require('../middleware');

const router = express.Router();

router.get(
  '/application-details/:dealId/facilities/:facilityId/confirm-deletion',
  [validateToken, validateBank, validateRole({ role: ['maker'] })],
  (req, res) => facilityConfirmDeletion(req, res),
);
router.post(
  '/application-details/:dealId/facilities/:facilityId/confirm-deletion',
  [validateToken, validateBank, validateRole({ role: ['maker'] })],
  (req, res) => deleteFacility(req, res),
);

module.exports = router;
