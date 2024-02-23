import express from 'express';

import userAdminRoutes from './users';

import { validateToken, validateRole } from '../middleware';
import { ROLES } from '../../constants';

const router = express.Router();

router.use('/admin/', [validateToken, validateRole({ role: [ROLES.ADMIN] }), userAdminRoutes]);

export default router;
