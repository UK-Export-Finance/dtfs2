import express from 'express';
import applicationRoutes from './application';

const router = express.Router();

router.use('/', applicationRoutes);

export default router;
