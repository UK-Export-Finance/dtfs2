const db = require('../../drivers/db-client');
const { UTILISATION_REPORT_HEADERS } = require('../../constants/utilisationReportHeaders');
const { DB_COLLECTIONS } = require('../../constants/db_collections');

// Do we want to save exporter, base currency and facility limit or anything if we can pull these from existing data?
const saveUtilisationData = async (reportData, month, year, bank, reportId) => {
  const utilisationDataObjects = reportData.map((report_data_entry) => {
    return {
      facilityId: report_data_entry[UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID]?.value,
      reportId,
      bankId: bank.id,
      month,
      year,
      exporter: report_data_entry[UTILISATION_REPORT_HEADERS.EXPORTER]?.value,
      baseCurrency: report_data_entry[UTILISATION_REPORT_HEADERS.BASE_CURRENCY]?.value,
      facility_utilisation: report_data_entry[UTILISATION_REPORT_HEADERS.FACILITY_UTILISATION]?.value,
      total_fees_accrued_for_the_month: report_data_entry[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED]?.value,
      monthly_fees_paid_to_ukef: report_data_entry[UTILISATION_REPORT_HEADERS.MONTHLY_FEES_PAID]?.value,
      payment_currency: report_data_entry[UTILISATION_REPORT_HEADERS.PAYMENT_CURRENCY]?.value,
      exchange_rate: report_data_entry[UTILISATION_REPORT_HEADERS.EXCHANGE_RATE]?.value,
      payments: null,
    };
  });

  const utilisationDataColletion = await db.getCollection(DB_COLLECTIONS.UTILISATION_DATA);
  return await utilisationDataColletion.insertMany(utilisationDataObjects);
};

module.exports = { saveUtilisationData };
