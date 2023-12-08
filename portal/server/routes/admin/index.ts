import express from 'express';

import userAdminRoutes from './users';
import activityRoutes from './activity';

import { validateToken, validateRole } from '../middleware';
import { ADMIN } from '../../constants/roles';

const router = express.Router();

router.use('/admin/*', [validateToken, validateRole({ role: [ADMIN] })]);
router.use('/admin/', userAdminRoutes);
router.use('/admin/', activityRoutes);

export default router;
