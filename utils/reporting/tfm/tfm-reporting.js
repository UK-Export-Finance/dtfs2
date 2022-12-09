/**
 * TFM REPORTING
 * **************
 * Purpose of this script is to generate a bespoke
 * report of all completed deals from TFM
 */

const CONSTANTS = require('../../data-migration/constant');
const { getCollection, disconnect } = require('../../data-migration/helpers/database');
const { write } = require('../../data-migration/helpers/io');
const { stripCommas, getMaximumLiability } = require('../../data-migration/helpers/format');

// ******************** DEALS *************************
/**
   * Return all the TFM deals with `MIA/MIN` filter.
   * @param {Integer} EPOCH Fetch records greater than.
   * Defaulted to `1648684800` (31-03-2022). This argument
   * accepts EPOCH with `ms`
   * @returns {Object} Collection object
   */
const getTfmDeals = (epoch = 1648684800) => getCollection(
  CONSTANTS.DATABASE.TABLES.TFM_DEAL,
  { 'tfm.stage': 'Confirmed', 'tfm.dateReceivedTimestamp': { $gte: epoch } },
);

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
      const { bank, dealType, submissionType } = dealSnapshot;
      const { stage, lastUpdated, parties } = tfm;
      const ukefDealId = dealSnapshot.ukefDealId ?? dealSnapshot.details.ukefDealId;
      const destinationCountry = dealSnapshot.submissionDetails
        ? stripCommas(dealSnapshot.submissionDetails.destinationOfGoodsAndServices.name)
        : '';
      const exporterName = stripCommas(dealSnapshot.exporter.companyName)
          ?? stripCommas(dealSnapshot.submissionDetails['supplier-name']);
      const exporterUrn = parties.exporter.partyUrn;
      const { exporterCreditRating } = tfm;
      const buyerName = dealSnapshot.submissionDetails
        ? stripCommas(dealSnapshot.submissionDetails['buyer-name'])
        : '';
      const buyerUrn = parties.buyer.bankUrn;
      const bankName = bank.name;
      const bankUrn = bank.partyUrn;
      // Amalgamation of all facilities `facility.ukefExposure`
      const maximumLiability = `£${getMaximumLiability(dealSnapshot.facilities)}`;
      const submissionDate = dealSnapshot.submissionDate ?? dealSnapshot.details.submissionDate;

      processed.push([
        ukefDealId,
        dealType,
        submissionType,
        stage,
        destinationCountry,
        exporterName,
        exporterUrn,
        exporterCreditRating || '',
        buyerName,
        buyerUrn,
        bankName,
        bankUrn,
        maximumLiability,
        new Date(Number(submissionDate)),
        new Date(Number(lastUpdated)),
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
  const path = `${__dirname}/report/csv/TFM_${new Date().valueOf()}.csv`;
  let csv = '';
  const data = [
    [
      'UKEF Deal ID',
      'Deal type',
      'Submission type',
      'TFM stage',
      'Destination country',
      'Exporter name',
      'Exporter URN',
      'Exporter credit rating',
      'Buyer name',
      'Buyer URN',
      'Bank name',
      'Bank URN',
      'Maximum liability (GBP)',
      'Submission date',
      'Last updated',
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
  console.info('\n\x1b[33m%s\x1b[0m', '🚀 Initiating TFM reporting.', '\n\n');

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
