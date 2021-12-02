const express = require('express');
const { processCoverStartDate } = require('../controllers/ukef-cover-start-date');
const { applicationDetails } = require('../controllers/application-details');
const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.get('/application-details/:applicationId/:facilityId/ukef-cover-start-date/', validateToken, (req, res) => applicationDetails(req, res));
router.post('/application-details/:applicationId/:facilityId/ukef-cover-start-date/', validateToken, (req, res) => processCoverStartDate(req, res));

module.exports = router;
