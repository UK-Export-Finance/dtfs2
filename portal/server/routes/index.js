import express from 'express';
import startRoutes from './start';
import loginRoutes from './login';
import dashboardRoutes from './dashboard';
import contractRoutes from './contract';
import miscRoutes from './misc';

const router = express.Router();

router.use('/', startRoutes);
router.use('/', loginRoutes);
router.use('/', dashboardRoutes);
router.use('/', contractRoutes);
router.use('/', miscRoutes);

export default router;
