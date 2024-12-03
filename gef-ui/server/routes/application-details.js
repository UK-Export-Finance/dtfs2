const express = require('express');
const { applicationDetails, postApplicationDetails } = require('../controllers/application-details');
const { validateToken, validateBank, validateRole } = require('../middleware');
const { MAKER, CHECKER, READ_ONLY, ADMIN } = require('../constants/roles');

const router = express.Router();

router.get('/application-details/:dealId', [validateToken, validateBank, validateRole({ role: [MAKER, CHECKER, READ_ONLY, ADMIN] })], (req, res) =>
  applicationDetails(req, res),
);
router.post('/application-details/:dealId', [validateToken, validateBank, validateRole({ role: [MAKER] })], (req, res) => postApplicationDetails(req, res));

module.exports = router;
