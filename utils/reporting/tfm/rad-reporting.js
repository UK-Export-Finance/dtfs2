/**
 * RAD REPORTING
 * **************
 * Purpose of this script is to generate a bespoke
 * report for RAD as per all the TFM deals.
 */

const CONSTANTS = require('../../data-migration/constant');
const { getCollection, disconnect } = require('../../data-migration/helpers/database');
const { write } = require('../../data-migration/helpers/io');
const { stripCommas, getMaximumLiability, filterTask } = require('../../data-migration/helpers/format');

// ******************** DEALS *************************
/**
  * Return all the TFM deals with `MIA/MIN` filter.
  * @param {Object} filter Mongo filter
  * @returns {Object} Collection object
  */
const getTfmDeals = () => getCollection(CONSTANTS.DATABASE.TABLES.TFM_DEAL, { $or: [
  { 'dealSnapshot.submissionType': 'Manual Inclusion Application' },
  { 'dealSnapshot.submissionType': 'Manual Inclusion Notice' }] });

// ******************** REPORTING *************************

/**
 * Process TFM deals into bespoke array of data
 * to match reporting columns.
 * @param {Array} deals Array of deals object
 * @return {Promise} Processed deals
 */
const constructRows = (deals) => {
  const rows = deals.map((deal) => {
    const processed = [];

    if (deal) {
      const { dealSnapshot, tfm } = deal;
      const ukefDealId = dealSnapshot.ukefDealId ?? dealSnapshot.details.ukefDealId;
      const submissionDate = dealSnapshot.submissionDate ?? dealSnapshot.details.submissionDate;
      const destinationCountry = dealSnapshot.submissionDetails
        ? stripCommas(dealSnapshot.submissionDetails.destinationOfGoodsAndServices.name)
        : '';
      const exporterName = stripCommas(dealSnapshot.exporter.companyName)
          ?? stripCommas(dealSnapshot.submissionDetails['supplier-name']);
      const exporterUrn = tfm.parties.exporter.partyUrn;
      const { exporterCreditRating } = tfm;
      // Amalgamation of all facilities `facility.ukefExposure`
      const maximumLiability = `£${getMaximumLiability(dealSnapshot.facilities)}`;
      // `Complete risk analysis (RAD)` task
      const radTask = filterTask(tfm, 'Complete risk analysis (RAD)');
      const approver = stripCommas(radTask?.assignedTo?.userFullName) ?? '';
      const approveDate = radTask?.dateCompleted
        ? new Date(Number(radTask.dateCompleted))
        : '';

      processed.push([
        ukefDealId,
        tfm.stage,
        dealSnapshot.dealType,
        dealSnapshot.submissionType,
        destinationCountry,
        exporterName,
        exporterUrn,
        '',
        exporterCreditRating || '',
        maximumLiability,
        approver,
        approveDate,
        new Date(Number(submissionDate)),
      ]);
    }

    return processed;
  });

  return Promise.resolve(rows);
};

/**
 * Generates bespoke report as CSV
 * @param {Array} rows Array of processed deals
 * @returns {Null} Null is returned
 */
const generateReport = async (rows) => {
  const path = `${__dirname}/report/csv/RAD_${new Date().valueOf()}.csv`;
  let csv = '';
  const data = [
    [
      'UKEF Deal ID',
      'Deal status',
      'Deal type',
      'Submission type',
      'Destination country',
      'Exporter name',
      'Exporter URN',
      'Guarantor',
      'Exporter credit rating',
      'Maximum liability (GBP)',
      'Approval level name',
      'Date approved',
      'Submission date',
    ],
  ];

  if (rows) {
    rows.forEach((deal) => {
      data.push(deal);
    });
  }

  data.forEach((row) => {
    csv = csv.concat(row.join(','), '\n');
  });

  if (await write(path, csv)) {
    console.info('\x1b[33m%s\x1b[0m', `✅ Report successfully generated at ${path}.`, '\n');
    return Promise.resolve(true);
  }

  return Promise.reject();
};

// ******************** MAIN *************************

/**
 * Entry point function.
 * Initiates report generation process
 * @returns {Boolean} Execution status
 */
const generate = () => {
  console.info('\n\x1b[33m%s\x1b[0m', '🚀 Initiating RAD reporting.', '\n\n');

  getTfmDeals()
    .then((deals) => constructRows(deals))
    .then((rows) => generateReport(rows))
    .then(() => disconnect())
    .then(() => process.exit(1))
    .catch((error) => {
      console.error('\n\x1b[31m%s\x1b[0m', '🚩 Report generation failed.\n', { error });
      process.exit(1);
    });
};

generate();
