const express = require('express');
const reportsController = require('../controllers/dashboard/reports.controller');
const { validateToken, validateBank, validateRole } = require('./middleware');

const reportsRouter = express.Router();

reportsRouter.get('/reports', [validateToken, validateBank, validateRole({ role: ['maker', 'checker'] })], reportsController.getPortalReports);
reportsRouter.get('/reports/review-unissued-facilities', [validateToken, validateBank, validateRole({ role: ['maker', 'checker'] })], reportsController.getUnissuedFacilitiesReport);
reportsRouter.get('/reports/review-unconditional-decision', [validateToken, validateBank, validateRole({ role: ['maker', 'checker'] })], reportsController.getUnconditionalDecisionReport);
reportsRouter.get('/reports/review-conditional-decision', [validateToken, validateBank, validateRole({ role: ['maker', 'checker'] })], reportsController.getConditionalDecisionReport);
reportsRouter.get('/reports/download-unissued-facilities-report', [validateToken, validateBank, validateRole({ role: ['maker', 'checker'] })], reportsController.downloadUnissuedFacilitiesReport);
reportsRouter.get('/reports/download-unconditional-decision-report', [validateToken, validateBank, validateRole({ role: ['maker', 'checker'] })], reportsController.downloadUnconditionalDecisionReport);
reportsRouter.get('/reports/download-conditional-decision-report', [validateToken, validateBank, validateRole({ role: ['maker', 'checker'] })], reportsController.downloadConditionalDecisionReport);

module.exports = reportsRouter;
