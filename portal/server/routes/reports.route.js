const express = require('express');
const { getPortalReports, getUnissuedFacilitiesReports, downloadUnissuedFacilitiesReports } = require('../controllers/dashboard/reports.controller');

const router = express.Router();

router.get('/portal-reports', getPortalReports);
router.get('/reports/unissued-facilities', getUnissuedFacilitiesReports);
router.get('/download-report-unissued-facilities', downloadUnissuedFacilitiesReports);

module.exports = router;
