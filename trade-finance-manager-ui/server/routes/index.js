const express = require('express');

const loginRoutes = require('./login');
const caseRoutes = require('./case');
const dealsRoutes = require('./deals');

const { validateUser } = require('../middleware/user-validation');

const router = express.Router();

router.use('/', loginRoutes);
router.use('/case', validateUser, caseRoutes);
router.use('/deals', validateUser, dealsRoutes);

module.exports = router;
