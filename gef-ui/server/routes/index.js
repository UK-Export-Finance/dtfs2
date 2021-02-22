import express from 'express';
import mandatoryCriteriaRoutes from './mandatory-criteria';
import nameApplicationRoutes from './name-application';
import applicationDetailsRoutes from './application-details';
import ineligibleRoutes from './ineligible';

const router = express.Router();

router.use(mandatoryCriteriaRoutes);
router.use(nameApplicationRoutes);
router.use(ineligibleRoutes);
router.use(applicationDetailsRoutes);

export default router;
