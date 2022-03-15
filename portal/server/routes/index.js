const express = require('express');
const startRoutes = require('./start');
const loginRoutes = require('./login');
const dashboardRoutes = require('./dashboard');
const contractRoutes = require('./contract');
const miscRoutes = require('./misc');
const adminRoutes = require('./admin');
const userRoutes = require('./user');
const mgaRoutes = require('./mga');
const schemeTypeRoutes = require('./schemeType');
const portalRoutes = require('./reports.route');
const feedbackRoutes = require('./feedback');

const router = express.Router();

router.use('/', startRoutes);
router.use('/', loginRoutes);
router.use('/', dashboardRoutes);
router.use('/', contractRoutes);
router.use('/', miscRoutes);
router.use('/', adminRoutes);
router.use('/', userRoutes);
router.use('/', mgaRoutes);
router.use('/', schemeTypeRoutes);
router.use('/', portalRoutes);
router.use('/', feedbackRoutes);

module.exports = router;
