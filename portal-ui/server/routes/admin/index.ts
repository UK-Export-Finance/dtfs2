import express from 'express';
import { ROLES } from '@ukef/dtfs2-common';

import userAdminRoutes from './users';

import { validateToken, validateRole } from '../middleware';

export const adminRouter = express.Router();

adminRouter.use('/admin/', [validateToken, validateRole({ role: [ROLES.ADMIN] }), userAdminRoutes]);
