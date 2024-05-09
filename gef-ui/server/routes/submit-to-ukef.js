const express = require('express');
const { submitToUkef, createSubmissionToUkef } = require('../controllers/submit-to-ukef');
const { validateBank, validateRole, validateToken } = require('../middleware');
const { CHECKER } = require('../constants/roles');

const router = express.Router();

router.get('/application-details/:dealId/submit-to-ukef', [validateToken, validateBank, validateRole({ role: [CHECKER] })], (req, res) =>
  submitToUkef(req, res),
);
router.post('/application-details/:dealId/submit-to-ukef', [validateToken, validateBank, validateRole({ role: [CHECKER] })], (req, res) =>
  createSubmissionToUkef(req, res),
);

module.exports = router;
