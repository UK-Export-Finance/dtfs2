const express = require('express');
const { applicationDetails } = require('../controllers/application-details');
const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.get('/application-details/:dealId/cover-start-date', validateToken, (req, res) => applicationDetails(req, res));

module.exports = router;
