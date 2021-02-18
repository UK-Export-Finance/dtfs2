import express from 'express';
import mandatoryCriteriaRoutes from './mandatory-criteria';
import nameApplicationRoutes from './name-application';
import ineligibleRoutes from './ineligible';

const router = express.Router();

router.use(mandatoryCriteriaRoutes);
router.use(nameApplicationRoutes);
router.use(ineligibleRoutes);

export default router;
