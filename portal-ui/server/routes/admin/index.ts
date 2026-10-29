import express from 'express';
import { ROLES } from '@ukef/dtfs2-common';

import { validateToken, validateRole } from '@ukef/portal-ui/server/routes/middleware';
import userAdminRoutes from './users';

export const adminRouter = express.Router();

adminRouter.use('/admin/', [validateToken, validateRole({ role: [ROLES.ADMIN] }), userAdminRoutes]);
