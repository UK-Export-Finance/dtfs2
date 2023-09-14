const express = require('express');
const { applicationDetails, postApplicationDetails } = require('../controllers/application-details');
const { validateToken, validateBank, validateRole } = require('../middleware');
const { MAKER, CHECKER, READ_ONLY } = require('../constants/roles');

const router = express.Router();

router.get('/application-details/:dealId', [validateToken, validateRole({role: [MAKER, CHECKER, READ_ONLY]}), validateBank], (req, res) => applicationDetails(req, res));
router.post('/application-details/:dealId', [validateToken, validateRole({role: [MAKER, CHECKER]}), validateBank], (req, res) => postApplicationDetails(req, res));

module.exports = router;
