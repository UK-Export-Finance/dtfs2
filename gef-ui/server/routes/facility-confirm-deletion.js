const express = require('express');
const {
  facilityConfirmDeletion,
  deleteFacility,
} = require('../controllers/facility-confirm-deletion');
const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.get('/application-details/:applicationId/facilities/:facilityId/confirm-deletion', validateToken, (req, res) => facilityConfirmDeletion(req, res));
router.post('/application-details/:applicationId/facilities/:facilityId/confirm-deletion', validateToken, (req, res) => deleteFacility(req, res));

module.exports = router;
