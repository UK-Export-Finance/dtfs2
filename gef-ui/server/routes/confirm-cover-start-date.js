const express = require('express');
const { processCoverStartDate } = require('../controllers/confirm-cover-start-date');
const { applicationDetails } = require('../controllers/application-details');
const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.get('/application-details/:dealId/:facilityId/confirm-cover-start-date/', validateToken, (req, res) => applicationDetails(req, res));
router.post('/application-details/:dealId/:facilityId/confirm-cover-start-date/', validateToken, (req, res) => processCoverStartDate(req, res));

module.exports = router;
