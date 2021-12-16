const express = require('express');
const {
  facilityCurrency,
  updateFacilityCurrency,
} = require('../controllers/facility-currency');
const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.get('/application-details/:dealId/facilities/:facilityId/facility-currency', validateToken, (req, res) => facilityCurrency(req, res));
router.post('/application-details/:dealId/facilities/:facilityId/facility-currency', validateToken, (req, res) => updateFacilityCurrency(req, res));

module.exports = router;
