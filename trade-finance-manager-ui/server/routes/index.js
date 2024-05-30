const express = require('express');

const homeRoutes = require('./home');
const loginRoutes = require('./login');
const caseRoutes = require('./case');
const dealsRoutes = require('./deals');
const facilitiesRoutes = require('./facilities');
const feedbackRoutes = require('./feedback');
const thankYouFeedbackRoutes = require('./feedback-thank-you');
const { utilisationReportsRoutes } = require('./utilisation-reports');
const footerRoutes = require('./footer');

const { validateUser } = require('../middleware');
const { validateToken } = require('../middleware');

const router = express.Router();

router.use('/home', validateToken, homeRoutes);
router.use('/', loginRoutes);
router.use('/case', validateUser, validateToken, caseRoutes);
router.use('/deals', validateUser, validateToken, dealsRoutes);
router.use('/facilities', validateUser, validateToken, facilitiesRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/thank-you-feedback', thankYouFeedbackRoutes);
router.use('/utilisation-reports', validateUser, validateToken, utilisationReportsRoutes);
router.use('/', footerRoutes);

module.exports = router;
