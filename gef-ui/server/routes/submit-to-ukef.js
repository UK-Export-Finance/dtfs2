const express = require('express');
const { submitToUkef, createSubmissionToUkef } = require('../controllers/submit-to-ukef');
const { validateRole, validateToken } = require('../middleware');

const router = express.Router();

router.get('/application-details/:dealId/submit-to-ukef', [validateToken, validateRole.validate({ role: ['checker'] })], (req, res) => submitToUkef(req, res));
router.post('/application-details/:dealId/submit-to-ukef', [validateToken, validateRole.validate({ role: ['checker'] })], (req, res) => createSubmissionToUkef(req, res));

module.exports = router;
