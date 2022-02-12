const express = require('express');
const { submitToUkef, createSubmissionToUkef } = require('../controllers/submit-to-ukef');
const validateToken = require('../middleware/validateToken');
const validateRole = require('../middleware/validateRole');

const router = express.Router();

router.get('/application-details/:dealId/submit-to-ukef', [validateToken, validateRole.validate({ role: ['checker'] })], (req, res) => submitToUkef(req, res));
router.post('/application-details/:dealId/submit-to-ukef', [validateToken, validateRole.validate({ role: ['checker'] })], (req, res) => createSubmissionToUkef(req, res));

module.exports = router;
