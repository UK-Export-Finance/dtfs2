const { getReportDownload } = require('./utilisation-report-download.controller');
const { uploadReportAndSendNotification } = require('./utilisation-report-upload.controller');
const { getPreviousReportsByBankId } = require('./previous-reports.controller');
const { getDueReportPeriodsByBankId } = require('./due-report-periods.controller');
const { getLastUploadedReportByBankId } = require('./last-uploaded.controller');
const { getNextReportPeriodByBankId } = require('./next-report-period.controller');
const { validateUtilisationReportData } = require('./validate-utilisation-report-data.controller');

// TODO: Export these using an index instead.
const { getFeeRecordCorrection } = require('./fee-record-corrections/get-fee-record-correction.controller');
const { getFeeRecordCorrectionReview } = require('./fee-record-corrections/get-fee-record-correction-review.controller');

module.exports = {
  getReportDownload,
  uploadReportAndSendNotification,
  getPreviousReportsByBankId,
  getDueReportPeriodsByBankId,
  getLastUploadedReportByBankId,
  getNextReportPeriodByBankId,
  validateUtilisationReportData,
  getFeeRecordCorrection,
  getFeeRecordCorrectionReview,
};
