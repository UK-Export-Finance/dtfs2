import express from 'express';

import userRoutes from './users';
import { validate } from '../role-validator';

const router = express.Router();

router.use('/admin/',
  validate({ role: ['admin', 'ukef_operations'] }),
  userRoutes);

export default router;
