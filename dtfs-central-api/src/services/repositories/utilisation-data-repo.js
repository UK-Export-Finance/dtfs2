const db = require('../../drivers/db-client');
const { UTILISATION_REPORT_HEADERS } = require('../../constants/utilisationReportHeaders');
const { DB_COLLECTIONS } = require('../../constants/db_collections');

/**
 * Saves the data from the utilisation report to the database.
 * @param {Object[]} reportData - Array of data that has been turned to json objects.
 * @param {number} month - Month of utilisation report, integer between 1 and 12.
 * @param {number} year - Year of utilisation report, integer greater than 2020.
 * @param {Object} bank - Object representing bank the report belongs to.
 * @param {String} reportId - Id of the report details database document.
 */
const saveUtilisationData = async (reportData, month, year, bank, reportId) => {
  const utilisationDataObjects = reportData.map((reportDataEntry) => ({
    facilityId: reportDataEntry[UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID],
    reportId,
    bankId: bank.id,
    month,
    year,
    exporter: reportDataEntry[UTILISATION_REPORT_HEADERS.EXPORTER],
    baseCurrency: reportDataEntry[UTILISATION_REPORT_HEADERS.BASE_CURRENCY],
    facility_utilisation: reportDataEntry[UTILISATION_REPORT_HEADERS.FACILITY_UTILISATION],
    total_fees_accrued_for_the_month: reportDataEntry[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED],
    monthly_fees_paid_to_ukef: reportDataEntry[UTILISATION_REPORT_HEADERS.MONTHLY_FEES_PAID],
    payment_currency: reportDataEntry[UTILISATION_REPORT_HEADERS.PAYMENT_CURRENCY],
    exchange_rate: reportDataEntry[UTILISATION_REPORT_HEADERS.EXCHANGE_RATE],
    payments: null,
  }));

  const utilisationDataCollection = await db.getCollection(DB_COLLECTIONS.UTILISATION_DATA);
  await utilisationDataCollection.insertMany(utilisationDataObjects);
  return;
};

module.exports = { saveUtilisationData };
