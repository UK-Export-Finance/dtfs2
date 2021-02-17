import express from 'express';
import mandatoryCriteriaRoutes from './mandatory-criteria';
import nameApplicationRoutes from './name-application';

const router = express.Router();

router.use(mandatoryCriteriaRoutes);
router.use(nameApplicationRoutes);

export default router;
