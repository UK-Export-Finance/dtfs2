import express from 'express';

import userRoutes from './users';

const router = express.Router();

router.use('/admin/',
  userRoutes);

export default router;
