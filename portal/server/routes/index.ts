import express from 'express';
import startRoutes from './start';
import loginRoutes from './login';
import dashboardRoutes from './dashboard';
import contractRoutes from './contract';
import eligibilityRoutes from './contract/eligibility';
import footerRoutes from './footer.route';
import adminRoutes from './admin';
import userRoutes from './user';
import feedbackRoutes from './feedback';
import schemeTypeRoutes from './schemeType';
import portalRoutes from './reports.route';
import staticRoutes from './static';
import utilisationReportServiceRoutes from './utilisation-report-service';
import defaultRoute from './default';

const router = express.Router();

router.use('/', startRoutes);
router.use('/', loginRoutes);
router.use('/', dashboardRoutes);
router.use('/', contractRoutes);
router.use('/', eligibilityRoutes);
router.use('/', footerRoutes);
router.use('/', adminRoutes);
router.use('/', userRoutes);
router.use('/', feedbackRoutes);
router.use('/', schemeTypeRoutes);
router.use('/', portalRoutes);
router.use('/', feedbackRoutes);
router.use('/', staticRoutes);
router.use('/', utilisationReportServiceRoutes);
router.use('/', defaultRoute);

export default router;
