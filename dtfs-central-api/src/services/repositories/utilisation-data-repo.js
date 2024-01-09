const db = require('../../drivers/db-client');
const { UTILISATION_REPORT_HEADERS } = require('../../constants/utilisationReportHeaders');
const { DB_COLLECTIONS } = require('../../constants/db-collections');

/**
 * @typedef {import('mongodb').ObjectId} ObjectId
 * @typedef {import('mongodb').OptionalId} OptionalId
 * @typedef {import('../../types/db-models/utilisation-data').UtilisationData} UtilisationData
 * @typedef {import('../../types/db-models/utilisation-reports').UtilisationReport} UtilisationReport
 */

/**
 * Saves the data from the utilisation report to the database.
 * @param {Object[]} reportData - Array of data that has been turned to json objects.
 * @param {number} month - Month of utilisation report, integer between 1 and 12.
 * @param {number} year - Year of utilisation report, integer greater than 2020.
 * @param {Object} bank - Object representing bank the report belongs to.
 * @param {string} reportId - ID of the report details database document.
 */
const saveUtilisationData = async (reportData, month, year, bank, reportId) => {
  /** @type {OptionalId<UtilisationData>[]} */
  const utilisationDataObjects = reportData.map((reportDataEntry) => ({
    facilityId: reportDataEntry[UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID],
    reportId,
    bankId: bank.id,
    month: Number(month),
    year: Number(year),
    exporter: reportDataEntry[UTILISATION_REPORT_HEADERS.EXPORTER],
    baseCurrency: reportDataEntry[UTILISATION_REPORT_HEADERS.BASE_CURRENCY],
    facilityUtilisation: Number(reportDataEntry[UTILISATION_REPORT_HEADERS.FACILITY_UTILISATION]),
    totalFeesAccruedForTheMonth: Number(reportDataEntry[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED]),
    totalFeesAccruedForTheMonthCurrency: reportDataEntry[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_CURRENCY],
    totalFeesAccruedForTheMonthExchangeRate: reportDataEntry[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_EXCHANGE_RATE]
      ? Number(reportDataEntry[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_EXCHANGE_RATE])
      : null,
    monthlyFeesPaidToUkef: Number(reportDataEntry[UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD]),
    monthlyFeesPaidToUkefCurrency: reportDataEntry[UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD_CURRENCY],
    paymentCurrency: reportDataEntry[UTILISATION_REPORT_HEADERS.PAYMENT_CURRENCY],
    paymentExchangeRate: reportDataEntry[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]
      ? Number(reportDataEntry[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE])
      : null,
    payments: null,
  }));

  const utilisationDataCollection = await db.getCollection(DB_COLLECTIONS.UTILISATION_DATA);
  await utilisationDataCollection.insertMany(utilisationDataObjects);
};

/**
 * Fetches all 'utilisationData' collection documents associated with the
 * specified report from the 'utilisationReports' collection
 * @param {UtilisationReport} report - The report to get utilisation data for
 * @returns {Promise<UtilisationData[]>}
 */
const getAllUtilisationDataForReport = async ({ _id: reportId, month, year }) => {
  const utilisationDataCollection = await db.getCollection(DB_COLLECTIONS.UTILISATION_DATA);
  return await utilisationDataCollection.find({ reportId: reportId.toString(), month, year }).toArray();
};

module.exports = {
  saveUtilisationData,
  getAllUtilisationDataForReport,
};
