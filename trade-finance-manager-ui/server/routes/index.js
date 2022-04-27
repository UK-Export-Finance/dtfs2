const express = require('express');

const loginRoutes = require('./login');
const caseRoutes = require('./case');
const dealsRoutes = require('./deals');
const facilitiesRoutes = require('./facilities');
const feedbackRoutes = require('./feedback');
const thankYouFeedbackRoutes = require('./feedback-thank-you');
const userRoutes = require('./user');
const footerRoutes = require('./footer');

const { validateUser } = require('../middleware/user-validation');

const router = express.Router();

router.use('/', loginRoutes);
router.use('/case', validateUser, caseRoutes);
router.use('/deals', validateUser, dealsRoutes);
router.use('/facilities', validateUser, facilitiesRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/thank-you-feedback', thankYouFeedbackRoutes);
router.use('/user', userRoutes);
router.use('/', footerRoutes);

module.exports = router;
