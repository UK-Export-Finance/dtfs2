const express = require('express');
const eligibleAutomaticCover = require('../controllers/eligible-automatic-cover');
const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.get('/application-details/:dealId/eligible-automatic-cover', validateToken, (req, res) => eligibleAutomaticCover(req, res));

module.exports = router;
