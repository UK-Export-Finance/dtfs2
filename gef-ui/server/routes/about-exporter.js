const express = require('express');
const {
  aboutExporter,
  validateAboutExporter,
} = require('../controllers/about-exporter');
const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.get('/application-details/:dealId/about-exporter', validateToken, (req, res) => aboutExporter(req, res));
router.post('/application-details/:dealId/about-exporter', validateToken, (req, res) => validateAboutExporter(req, res));

module.exports = router;
