const express = require('express');

const homeRoutes = require('./home');
const loginRoutes = require('./login');
const caseRoutes = require('./case');
const dealsRoutes = require('./deals');
const facilitiesRoutes = require('./facilities');
const feedbackRoutes = require('./feedback');
const thankYouFeedbackRoutes = require('./feedback-thank-you');
const userRoutes = require('./user');
const { utilisationReportsRoutes } = require('./utilisation-reports');
const footerRoutes = require('./footer');

const { validateUser } = require('../middleware');

const router = express.Router();

router.use('/home', homeRoutes);
router.use('/', loginRoutes);
router.use('/case', validateUser, caseRoutes);
router.use('/deals', validateUser, dealsRoutes);
router.use('/facilities', validateUser, facilitiesRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/thank-you-feedback', thankYouFeedbackRoutes);
router.use('/user', userRoutes);
router.use('/utilisation-reports', validateUser, utilisationReportsRoutes);
router.use('/', footerRoutes);

module.exports = router;
