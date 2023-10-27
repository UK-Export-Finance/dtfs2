const db = require('../../drivers/db-client');
const { UTILISATION_REPORT_HEADERS } = require('../../constants/utilisationReportHeaders');
const { DB_COLLECTIONS } = require('../../constants/db_collections');

/**
 * Saves the data from the utilisation report to the database.
 * @param {Object} reportData - Array of data that has been turned to json objects.
 * @param {Integer} month - Month of utilisation report, integer between 1 and 12.
 * @param {Integer} year - Year of utilisation report, integer greater than 2020.
 * @param {Object} bank - Object representing bank the report belongs to.
 * @param {String} reportId - Id of the report details database document.
 * @returns {Object} - result of the insertMany save operation.
 */
const saveUtilisationData = async (reportData, month, year, bank, reportId) => {
  const utilisationDataObjects = reportData.map((reportDataEntry) => ({
    facilityId: reportDataEntry[UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID]?.value,
    reportId,
    bankId: bank.id,
    month,
    year,
    exporter: reportDataEntry[UTILISATION_REPORT_HEADERS.EXPORTER]?.value,
    baseCurrency: reportDataEntry[UTILISATION_REPORT_HEADERS.BASE_CURRENCY]?.value,
    facility_utilisation: reportDataEntry[UTILISATION_REPORT_HEADERS.FACILITY_UTILISATION]?.value,
    total_fees_accrued_for_the_month: reportDataEntry[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED]?.value,
    monthly_fees_paid_to_ukef: reportDataEntry[UTILISATION_REPORT_HEADERS.MONTHLY_FEES_PAID]?.value,
    payment_currency: reportDataEntry[UTILISATION_REPORT_HEADERS.PAYMENT_CURRENCY]?.value,
    exchange_rate: reportDataEntry[UTILISATION_REPORT_HEADERS.EXCHANGE_RATE]?.value,
    payments: null,
  }));

  const utilisationDataColletion = await db.getCollection(DB_COLLECTIONS.UTILISATION_DATA);
  await utilisationDataColletion.insertMany(utilisationDataObjects);
};

module.exports = { saveUtilisationData };
