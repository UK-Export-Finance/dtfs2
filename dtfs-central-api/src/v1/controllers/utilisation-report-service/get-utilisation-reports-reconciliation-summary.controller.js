const { subMonths } = require('date-fns');
const { getAllBanks } = require('../../../services/repositories/banks-repo');
const { UTILISATION_REPORT_RECONCILIATION_STATUS } = require('../../../constants');
const { getOneIndexedMonth } = require('../../../utils/date');
const { getUtilisationReportDetailsByBankIdMonthAndYear } = require('../../../services/repositories/utilisation-reports-repo');
const { getAllUtilisationDataForReport } = require('../../../services/repositories/utilisation-data-repo');

/**
 * @typedef {import('../../../types/db-models/banks').Bank} Bank
 * @typedef {import('../../../types/date').IsoMonthStamp} IsoMonthStamp
 * @typedef {import('../../../types/utilisation-reports').UtilisationReportReconciliationSummaryItem} UtilisationReportReconciliationSummaryItem
 */

/**
 * @param {IsoMonthStamp} submissionMonth
 * @returns {{ month: number, year: number }}
 */
const getReportPeriodStartForSubmissionMonth = (submissionMonth) => {
  // TODO FN-???? - calculate report period start month based on report frequency (monthly or quarterly)
  const reportPeriodDate = subMonths(new Date(submissionMonth), 1);
  return {
    month: getOneIndexedMonth(reportPeriodDate),
    year: reportPeriodDate.getFullYear(),
  };
};

/**
 * @param {Bank} bank
 * @param {IsoMonthStamp} submissionMonth
 * @return {Promise<UtilisationReportReconciliationSummaryItem>}
 */
const generateReconciliationSummaryItem = async (bank, submissionMonth) => {
  const { month, year } = getReportPeriodStartForSubmissionMonth(submissionMonth);
  const report = await getUtilisationReportDetailsByBankIdMonthAndYear(bank.id, month, year);

  if (!report) {
    return {
      bank: {
        id: bank.id,
        name: bank.name,
      },
      status: UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED,
    };
  }

  const reportData = await getAllUtilisationDataForReport(report);

  // TODO FN-???? - status to be added to report data to allow us to calculate how
  //  many facilities are left to reconcile
  const reportedFeesLeftToReconcile = reportData.length;

  return {
    reportId: report._id,
    bank: {
      id: bank.id,
      name: bank.name,
    },
    status: report.status,
    dateUploaded: report.dateUploaded,
    totalFeesReported: reportData.length,
    reportedFeesLeftToReconcile,
    isPlaceholderReport: report.azureFileInfo === null,
  };
};

/**
 * @param {Bank[]} banks
 * @param {IsoMonthStamp} submissionMonth
 * @return {Promise<UtilisationReportReconciliationSummaryItem[]>}
 */
const generateReconciliationSummary = async (banks, submissionMonth) =>
  Promise.all(banks.map(async (bank) => await generateReconciliationSummaryItem(bank, submissionMonth)));

/**
 * @param {import('express').Request<{ submissionMonth: IsoMonthStamp }>} req
 * @param {import('express').Response<UtilisationReportReconciliationSummaryItem[]>} res
 */
const getUtilisationReportsReconciliationSummary = async (req, res) => {
  try {
    const { submissionMonth } = req.params;

    const banks = await getAllBanks();
    const reconciliationSummary = await generateReconciliationSummary(banks, submissionMonth);

    res.status(200).send(reconciliationSummary);
  } catch (error) {
    const errorMessage = 'Failed to get utilisation reports reconciliation summary';
    console.error(errorMessage, error);
    res.status(500).send(errorMessage);
  }
};

module.exports = {
  getUtilisationReportsReconciliationSummary,
};
