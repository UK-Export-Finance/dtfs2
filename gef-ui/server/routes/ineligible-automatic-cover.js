const express = require('express');
const ineligibleAutomaticCover = require('../controllers/ineligible-automatic-cover');
const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.get('/application-details/:dealId/ineligible-automatic-cover', validateToken, (req, res) => ineligibleAutomaticCover(req, res));

module.exports = router;
