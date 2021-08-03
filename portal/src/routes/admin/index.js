import express from 'express';

import userRoutes from './users';
import { validate } from '../role-validator';
import validateToken from '../middleware/validate-token';

const router = express.Router();

router.use('/admin/*', validateToken);

router.use('/admin/',
  validate({ role: ['admin', 'ukef_operations'] }),
  userRoutes);

export default router;
