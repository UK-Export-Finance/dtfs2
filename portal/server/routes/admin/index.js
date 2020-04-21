import express from 'express';
import api from '../../api';

import userRoutes from './users';

const router = express.Router();

router.use('/admin/',
  userRoutes);

export default router;
