import express from 'express';
import mandatoryCriteriaRoutes from './mandatory-criteria';
import nameApplicationRoutes from './name-application';
import applicationDetailsRoutes from './application-details';
import ineligibleRoutes from './ineligible';
import automaticCoverRoutes from './automatic-cover';

const router = express.Router();

router.use(mandatoryCriteriaRoutes);
router.use(nameApplicationRoutes);
router.use(ineligibleRoutes);
router.use(applicationDetailsRoutes);
router.use(automaticCoverRoutes);

export default router;
