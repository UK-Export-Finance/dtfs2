const express = require('express');
const { applicationDetails, postApplicationDetails } = require('../controllers/application-details');
const { validateToken, validateBank } = require('../middleware');

const router = express.Router();

router.get('/application-details/:dealId', [validateToken, validateBank], (req, res) => applicationDetails(req, res));
// TODO: DTFS2-6627 - Check whether this needs validation
router.post('/application-details/:dealId', [validateToken, validateBank], (req, res) => postApplicationDetails(req, res));

module.exports = router;
