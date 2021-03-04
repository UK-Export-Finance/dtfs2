import express from 'express';
import mandatoryCriteriaRoutes from './mandatory-criteria';
import nameApplicationRoutes from './name-application';
import applicationDetailsRoutes from './application-details';
import ineligibleGefRoutes from './ineligible-gef';
import ineligibleAutomaticCoverRoutes from './ineligible-automatic-cover';
import automaticCoverRoutes from './automatic-cover';

const router = express.Router();

router.use(mandatoryCriteriaRoutes);
router.use(nameApplicationRoutes);
router.use(ineligibleGefRoutes);
router.use(ineligibleAutomaticCoverRoutes);
router.use(applicationDetailsRoutes);
router.use(automaticCoverRoutes);

export default router;
