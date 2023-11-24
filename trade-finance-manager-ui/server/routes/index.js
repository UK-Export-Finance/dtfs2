const express = require('express');

const homeRoute = require('./home');
const loginRoutes = require('./login');
const caseRoutes = require('./case');
const dealsRoutes = require('./deals');
const facilitiesRoutes = require('./facilities');
const feedbackRoutes = require('./feedback');
const thankYouFeedbackRoutes = require('./feedback-thank-you');
const userRoutes = require('./user');
const footerRoutes = require('./footer');
const utilisationReportsRoutes = require('./utilisation-reports');

const { validateUser, isUserInPdcTeam } = require('../middleware');

const router = express.Router();

router.use(isUserInPdcTeam);

router.use('/home', homeRoute);
router.use('/', loginRoutes);
router.use('/case', validateUser, caseRoutes);
router.use('/deals', validateUser, dealsRoutes);
router.use('/facilities', validateUser, facilitiesRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/thank-you-feedback', thankYouFeedbackRoutes);
router.use('/user', userRoutes);
router.use('/', footerRoutes);
router.use('/utilisation-reports', validateUser, utilisationReportsRoutes);

module.exports = router;
