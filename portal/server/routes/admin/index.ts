import express from 'express';
import { ROLES } from '@ukef/dtfs2-common';

import userAdminRoutes from './users';

import { validateToken, validateRole } from '../middleware';

const router = express.Router();

router.use('/admin/', [validateToken, validateRole({ role: [ROLES.ADMIN] }), userAdminRoutes]);

export default router;
