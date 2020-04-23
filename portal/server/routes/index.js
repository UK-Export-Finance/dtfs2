import express from 'express';
import startRoutes from './start';
import loginRoutes from './login';
import dashboardRoutes from './dashboard';
import contractRoutes from './contract';
import miscRoutes from './misc';
import reportingRoutes from './reporting';
import adminRoutes from './admin';
import userRoutes from './user';

const router = express.Router();

router.use('/', startRoutes);
router.use('/', loginRoutes);
router.use('/', dashboardRoutes);
router.use('/', contractRoutes);
router.use('/', miscRoutes);
router.use('/', reportingRoutes);
router.use('/', adminRoutes);
router.use('/', userRoutes);

export default router;
