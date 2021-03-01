import express from 'express';
import loginRoutes from './login';
import caseRoutes from './case';
import dealsRoutes from './deals';

import { validateUser } from '../middleware/user-validation';

const router = express.Router();

router.use('/', loginRoutes);
router.use('/case', validateUser, caseRoutes);
router.use('/deals', validateUser, dealsRoutes);

export default router;
