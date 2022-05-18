const express = require('express');
const { aboutExporter, validateAboutExporter } = require('../controllers/about-exporter');
const { validateRole, validateToken, validateBank } = require('../middleware');

const router = express.Router();

router.get('/application-details/:dealId/about-exporter', [validateToken, validateBank, validateRole({ role: ['maker'] })], (req, res) => aboutExporter(req, res));
router.post('/application-details/:dealId/about-exporter', [validateToken, validateBank, validateRole({ role: ['maker'] })], (req, res) => validateAboutExporter(req, res));

module.exports = router;
