import { getMonthlyReportPeriodFromIsoSubmissionMonth } from '../support/utils/dateHelpers';

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
 * @property {{ start: { month: number, year: number }, end: { month: number, year: number } }} reportPeriod
 * @property {Date} [dateUploaded]
 * @property {object | null} azureFileInfo
 * @property {'REPORT_NOT_RECEIVED' | 'PENDING_RECONCILIATION' | 'RECONCILIATION_IN_PROGRESS' | 'RECONCILIATION_COMPLETED'} status
 * @property {object} [uploadedBy]
 */

/**
 * @typedef MockUtilisationReportOpts
 * @property {UtilisationReportDetails['bank']} bank
 * @property {string} submissionMonth - Submission month as ISO month string
 * @property {UtilisationReportDetails['status']} status
 */

/**
 * @type {Omit<UtilisationReportDetails, 'bank' | 'reportPeriod' | 'status'>}
 */
const mockUtilisationReportDetails = {
  dateUploaded: undefined,
  azureFileInfo: null,
  uploadedBy: undefined,
};

/**
 * @param {MockUtilisationReportOpts} opts
 * @returns {UtilisationReportDetails}
 */
export const createMockUtilisationReportDetails = (opts) => {
  const reportPeriod = getMonthlyReportPeriodFromIsoSubmissionMonth(opts.submissionMonth);
  if (opts.status !== UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED) {
    return {
      ...mockUtilisationReportDetails,
      reportPeriod,
      bank: opts.bank,
      status: opts.status,
      azureFileInfo: {},
    };
  }
  return {
    ...mockUtilisationReportDetails,
    reportPeriod,
    bank: opts.bank,
    status: opts.status,
  };
};
