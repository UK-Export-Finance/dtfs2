const express = require('express');
const reportsController = require('../controllers/dashboard/reports.controller');

const reportsRouter = express.Router();

reportsRouter.get('/reports', reportsController.getPortalReports);
reportsRouter.get('/reports/review-unissued-facilities', reportsController.getUnissuedFacilitiesReport);
reportsRouter.get('/reports/review-unconditional-decision', reportsController.getUnconditionalDecisionReport);
reportsRouter.get('/reports/review-conditional-decision', reportsController.getConditionalDecisionReport);
reportsRouter.get('/reports/download-unissued-facilities-report', reportsController.downloadUnissuedFacilitiesReport);
reportsRouter.get('/reports/download-unconditional-decision-report', reportsController.downloadUnconditionalDecisionReport);
reportsRouter.get('/reports/download-conditional-decision-report', reportsController.downloadConditionalDecisionReport);

module.exports = reportsRouter;
