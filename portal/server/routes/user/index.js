import express from 'express';

import userProfileRoutes from './profile';

const router = express.Router();

router.use('/user/',
  userProfileRoutes);

export default router;
