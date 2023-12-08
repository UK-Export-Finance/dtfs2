/**
 * @typedef {import('../../../types/utilisation-reports').UtilisationReportReconciliationStatus} ReconciliationStatus
 * @typedef {import('../../../types/utilisation-reports').UtilisationReportReconciliationSummaryItem} SummaryItemApiResponse
 * @typedef {SummaryItemApiResponse & { displayStatus: string; formattedDateUploaded?: string }} SummaryItemViewModel
 */

/**
 * @type {Record<ReconciliationStatus, string>}
 */
const reconciliationStatusCodeToDisplayStatus = {
  REPORT_NOT_RECEIVED: 'Not received',
  PENDING_RECONCILIATION: 'Pending reconciliation',
  RECONCILIATION_IN_PROGRESS: 'Reconciliation in progress',
  RECONCILIATION_COMPLETED: 'Report completed',
};

/**
 * Converts the reconciliation summary API response to the required view model
 * @param {SummaryItemApiResponse[]} summaryApiResponse - the summary API response
 * @return {SummaryItemViewModel[]}
 */
const getReportReconciliationSummaryViewModel = (summaryApiResponse) =>
  summaryApiResponse.map((item) => ({
    ...item,
    displayStatus: reconciliationStatusCodeToDisplayStatus[item.status],
  }));

module.exports = {
  getReportReconciliationSummaryViewModel,
};
