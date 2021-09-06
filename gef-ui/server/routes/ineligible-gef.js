const express = require('express');
const ineligibleGef = require('../controllers/ineligible-gef');
const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.get('/ineligible-gef', validateToken, (req, res) => ineligibleGef(req, res));

module.exports = router;
