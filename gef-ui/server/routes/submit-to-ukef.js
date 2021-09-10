const express = require('express');
const { submitToUkef, createSubmissionToUkef } = require('../controllers/submit-to-ukef');
const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.get('/application-details/:applicationId/submit-to-ukef', validateToken, (req, res) => submitToUkef(req, res));
router.post('/application-details/:applicationId/submit-to-ukef', validateToken, (req, res) => createSubmissionToUkef(req, res));

module.exports = router;
