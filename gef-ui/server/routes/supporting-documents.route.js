const express = require('express');
const supportingInformation = require('./supporting-information');

const router = express.Router();
router.use(supportingInformation);

module.exports = router;
