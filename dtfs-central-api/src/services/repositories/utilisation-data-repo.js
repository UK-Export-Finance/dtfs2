const db = require('../../drivers/db-client');
const { UTILISATION_REPORT_HEADERS } = require('../../constants/utilisationReportHeaders');
const { DB_COLLECTIONS } = require('../../constants/db_collections');

// Do we want to save exporter, base currency and facility limit or anything if we can pull these from existing data?
const saveUtilisationData = async (report_data, month, year, bank, report_id) => {
  const utilisationDataObjects = report_data.map((report_data_entry) => {
    return {
      facilityId: report_data.ukef_facility_id,
      reportId: report_id,
      bankId: bank.Id,
      month,
      year,
      exporter: report_data_entry[UTILISATION_REPORT_HEADERS.EXPORTER],
      baseCurrency: report_data_entry[UTILISATION_REPORT_HEADERS.BASE_CURRENCY],
      facility_utilisation: report_data_entry[UTILISATION_REPORT_HEADERS.FACILITY_UTILISATION],
      total_fees_accrued_for_the_month: report_data_entry[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED],
      monthly_fees_paid_to_ukef: report_data_entry[UTILISATION_REPORT_HEADERS.MONTHLY_FEES_PAID],
      payment_currency: report_data_entry[UTILISATION_REPORT_HEADERS.PAYMENT_CURRENCY],
      exchange_rate: report_data_entry[UTILISATION_REPORT_HEADERS.EXCHANGE_RATE],
      payments: null,
    };
  });

  db.getCollection(DB_COLLECTIONS.UTILISATION_DATA).insertMany(utilisationDataObjects);
};

module.exports = { saveUtilisationData };
