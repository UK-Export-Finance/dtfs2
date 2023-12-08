const MOCK_BANKS = require('./mock-banks');
const UTILISATION_REPORT_RECONCILIATION_STATUS = require('../constants/utilisation-report-reconciliation-status');

/**
 * @type {import('../types/utilisation-reports').UtilisationReportReconciliationSummaryItem[]}
 */
const MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY = [
  {
    bank: {
      id: MOCK_BANKS.HSBC.id,
      name: MOCK_BANKS.HSBC.name,
    },
    status: UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED,
  },
];

module.exports = MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY;
