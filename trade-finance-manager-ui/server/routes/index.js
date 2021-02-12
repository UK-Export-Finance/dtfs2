import express from 'express';
import loginRoutes from './login';
import caseRoutes from './case';
import dealsRoutes from './deals';


const router = express.Router();

router.use('/', loginRoutes);
router.use('/case', caseRoutes);
router.use('/deals', dealsRoutes);

export default router;
