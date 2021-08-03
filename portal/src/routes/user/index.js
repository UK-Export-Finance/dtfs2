import express from 'express';

import userProfileRoutes from './profile';
import validateToken from '../middleware/validate-token';

const router = express.Router();

router.use('/user/*', validateToken);

router.use('/user/',
  userProfileRoutes);

export default router;
