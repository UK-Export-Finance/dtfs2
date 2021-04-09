import express from 'express';
import mandatoryCriteriaRoutes from './mandatory-criteria';
import nameApplicationRoutes from './name-application';
import applicationDetailsRoutes from './application-details';
import ineligibleGefRoutes from './ineligible-gef';
import ineligibleAutomaticCoverRoutes from './ineligible-automatic-cover';
import automaticCoverRoutes from './automatic-cover';
import companiesHouseRoutes from './companies-house';
import exportersAddressRoutes from './exporters-address';
import selectExportersCorrespondenceAddressRoutes from './select-exporters-correspondence-address';
import enterExportersCorrespondenceAddressRoutes from './enter-exporters-correspondence-address';
import aboutExporterRoutes from './about-exporter';
import facilitiesRoutes from './facilities';
import aboutFacilityRoutes from './about-facility';
import providedFacilityRoutes from './provided-facility';

const router = express.Router();

router.use(mandatoryCriteriaRoutes);
router.use(nameApplicationRoutes);
router.use(ineligibleGefRoutes);
router.use(ineligibleAutomaticCoverRoutes);
router.use(applicationDetailsRoutes);
router.use(automaticCoverRoutes);
router.use(companiesHouseRoutes);
router.use(exportersAddressRoutes);
router.use(selectExportersCorrespondenceAddressRoutes);
router.use(enterExportersCorrespondenceAddressRoutes);
router.use(aboutExporterRoutes);
router.use(facilitiesRoutes);
router.use(aboutFacilityRoutes);
router.use(providedFacilityRoutes);

export default router;
