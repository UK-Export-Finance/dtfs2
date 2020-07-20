import express from 'express';
import startRoutes from './start';
import loginRoutes from './login';
import dashboardRoutes from './dashboard';
import contractRoutes from './contract';
import miscRoutes from './misc';
import reportRoutes from './reports';
import adminRoutes from './admin';
import userRoutes from './user';
import mgaRoutes from './mga';
import feedbackRoutes from './feedback';

const router = express.Router();

router.use('/', startRoutes);
router.use('/', loginRoutes);
router.use('/', dashboardRoutes);
router.use('/', contractRoutes);
router.use('/', miscRoutes);
router.use('/', reportRoutes);
router.use('/', adminRoutes);
router.use('/', userRoutes);
router.use('/', mgaRoutes);
router.use('/', feedbackRoutes);

export default router;
