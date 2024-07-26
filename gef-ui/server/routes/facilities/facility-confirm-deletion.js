const express = require('express');
const { facilityConfirmDeletion, deleteFacility } = require('../../controllers/facility-confirm-deletion');
const { validateRole, validateToken, validateBank } = require('../../middleware');
const { MAKER } = require('../../constants/roles');

const router = express.Router();

router.get('/application-details/:dealId/facilities/:facilityId/confirm-deletion', [validateToken, validateBank, validateRole({ role: [MAKER] })], (req, res) =>
  facilityConfirmDeletion(req, res),
);
router.post(
  '/application-details/:dealId/facilities/:facilityId/confirm-deletion',
  [validateToken, validateBank, validateRole({ role: [MAKER] })],
  (req, res) => deleteFacility(req, res),
);

module.exports = router;
