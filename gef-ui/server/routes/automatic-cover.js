const express = require('express');
const {
  automaticCover,
  validateAutomaticCover,
} = require('../controllers/automatic-cover');
const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.get('/application-details/:applicationId/automatic-cover', validateToken, (req, res) => automaticCover(req, res));
router.post('/application-details/:applicationId/automatic-cover', validateToken, (req, res) => validateAutomaticCover(req, res));

module.exports = router;
