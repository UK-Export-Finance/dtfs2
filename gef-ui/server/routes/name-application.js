const express = require('express');
const { nameApplication, createApplication, updateApplicationReferences } = require('../controllers/name-application');
const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.get('/name-application', validateToken, (req, res) => nameApplication(req, res));
router.post('/name-application', validateToken, (req, res) => createApplication(req, res));
router.get('/applications/:id/name', validateToken, nameApplication);
router.post('/applications/:id/name', validateToken, updateApplicationReferences);

module.exports = router;
