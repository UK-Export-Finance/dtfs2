import express from 'express';
import loginRoutes from './login';
import caseRoutes from './case';

const router = express.Router();

router.use('/', loginRoutes);
router.use('/', caseRoutes);


export default router;
