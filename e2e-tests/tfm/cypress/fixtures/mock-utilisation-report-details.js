/**
 * @typedef {'REPORT_NOT_RECEIVED' | 'PENDING_RECONCILIATION' | 'RECONCILIATION_IN_PROGRESS' | 'RECONCILIATION_COMPLETED'} UtilisationReportReconciliationStatus
 * @typedef {{ id: string, name: string }} Bank
 * @typedef {{ start: { month: number, year: number }, end: { month: number, year: number } }} ReportPeriod
 */

/**
 * @type {Record<UtilisationReportReconciliationStatus, UtilisationReportReconciliationStatus>}
 */
export const UTILISATION_REPORT_RECONCILIATION_STATUS = {
  REPORT_NOT_RECEIVED: 'REPORT_NOT_RECEIVED',
  PENDING_RECONCILIATION: 'PENDING_RECONCILIATION',
  RECONCILIATION_IN_PROGRESS: 'RECONCILIATION_IN_PROGRESS',
  RECONCILIATION_COMPLETED: 'RECONCILIATION_COMPLETED',
};

/**
 * @typedef UtilisationReportDetails
 * @property {import('mongodb').ObjectId} [_id]
 * @property {{ id: string, name: string }} bank
 * @property {ReportPeriod} reportPeriod
 * @property {Date} [dateUploaded]
 * @property {object | null} azureFileInfo
 * @property {UtilisationReportReconciliationStatus} status
 * @property {object} [uploadedBy]
 */

/**
 * @type {UtilisationReportDetails}
 */
export const MOCK_UTILISATION_REPORT_DETAILS_WITHOUT_ID = {
  bank: {
    id: '999',
    name: 'Mock bank',
  },
  reportPeriod: {
    start: {
      month: 1,
      year: 2024,
    },
    end: {
      month: 1,
      year: 2024,
    },
  },
  dateUploaded: new Date(),
  azureFileInfo: {},
  status: UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION,
  uploadedBy: {},
};

/**
 * Creates utilisation report details for the given bank
 * in the not received state
 * @param {Bank} bank - The bank
 * @param {{ reportPeriod?: ReportPeriod }} [opts]
 * @returns {UtilisationReportDetails} The report
 */
export const createNotReceivedReportDetails = (bank, opts) => ({
  bank,
  reportPeriod: opts?.reportPeriod ?? MOCK_UTILISATION_REPORT_DETAILS_WITHOUT_ID.reportPeriod,
  azureFileInfo: null,
  status: UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED,
});
