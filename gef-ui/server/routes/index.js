import express from 'express';
import dealRoutes from './deal';

const router = express.Router();

router.use('/', dealRoutes);

export default router;
