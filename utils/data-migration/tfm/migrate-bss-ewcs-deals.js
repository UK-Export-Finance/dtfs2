/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/**
 * DATA MIGRATION
 * **************
 * Purpose of this script is to migrate `BSS/EWCS` deals to TFM
 * with myriads of data-fixes.
 *
 * `BSS/EWCS` TFM data has been provided from Workflow JSON exports.
 */

const axios = require('axios');
const CONSTANTS = require('../constant');
const { getCollection, disconnect } = require('../helpers/database');
const { datafixes, datafixesTfmDeal, datafixesTfmFacilities } = require('../helpers/datafixes');
const { sleep } = require('../helpers/io');

const version = '0.0.1';
const { TFM_API } = process.env;
const allTfmDeals = [];

// ******************** DEALS *************************

/**
 * Return all the portal deals, without (default) or with filter specified.
 * @param {Object} filter Mongo filter
 * @returns {Object} Collection object
 */
const getDeals = (filter = null) => getCollection(CONSTANTS.DATABASE.TABLES.DEAL, filter);

/**
 * Return all the TFM deals, without (default) or with filter specified.
 * @param {Object} filter Mongo filter
 * @returns {Object} Collection object
 */
const getTfmDeals = () => getCollection(CONSTANTS.DATABASE.TABLES.TFM_DEAL, { 'dealSnapshot.dealType': CONSTANTS.DEAL.DEAL_TYPE.BSS_EWCS });

/**
 * Extracts deals from `deals` collection with following filters
 * 1. Deal Type: `BSS/EWCS`
 * 2. Property exists check: `dataMigration`
 * @returns {Promise} Response on success, Reject upon a failure.
 */
const deals = async () => {
  console.info('\x1b[33m%s\x1b[0m', `➕ 1. Fetching all ${CONSTANTS.DEAL.DEAL_TYPE.BSS_EWCS} deals`, '\n');

  /**
   * AND condition
   * 1. Deal type : BSS/EWCS
   * 2. Property exists : dataMigration
   */
  const filter = {
    $and: [{ dealType: CONSTANTS.DEAL.DEAL_TYPE.BSS_EWCS }, { dataMigration: { $exists: true } }],
  };

  return getDeals(filter)
    .then((data) => {
      if (data && data.length > 0) {
        console.info('\x1b[33m%s\x1b[0m', `✅ ${data.length} deals fetched.`, '\n');
        return Promise.resolve(data);
      }

      return Promise.reject(new Error('Empty data set'));
    })
    .catch((e) => Promise.reject(new Error(`Deals fetch failed ${e}`)));
};

// ******************** TFM *************************

const tfm = async (data) => {
  console.info('\x1b[33m%s\x1b[0m', '➕ 3. Submitting to TFM', '\n');

  if (!data || !data.length) {
    return Promise.reject(new Error('No deals to submit to TFM'));
  }

  let counter = 0;
  let percentage = 0;

  const checker = {
    username: 'BANK1_CHECKER1',
    roles: ['checker'],
    bank: {
      id: '9',
      name: 'UKEF test bank (Delegated)',
      mga: ['mga_ukef_1.docx', 'mga_ukef_2.docx'],
      emails: ['maker1@ukexportfinance.gov.uk', 'checker1@ukexportfinance.gov.uk'],
      companiesHouseNo: 'UKEF0001',
      partyUrn: '00318345',
    },
    lastLogin: String(new Date().valueOf()),
    firstname: 'Data',
    surname: 'Migration',
    email: 'checker1@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    'user-status': 'active',
    _id: '627b70305ac41e001d37294a',
  };

  for (const deal of data) {
    await axios({
      method: 'put',
      url: `${TFM_API}/v1/deals/submit`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        dealId: deal._id,
        dealType: deal.dealType,
        checker,
      },
    })
      .then((inserted) => {
        if (inserted.status === 200) {
          counter += 1;
          percentage = Math.round((counter / data.length) * 100);

          console.info('\x1b[33m%s\x1b[0m', `${percentage}% : ${counter}/${data.length} Submitted.`, '\n');
          allTfmDeals.push(inserted.data);
        } else {
          throw new Error('\x1b[31m%s\x1b[0m', `🚩 Error inserting deal ${inserted}`);
        }
      })
      .catch((error) => Promise.reject(new Error(`🚩 Error inserting deal ${error}`)));

    if (counter % 100 === 0) {
      console.info('\x1b[33m%s\x1b[0m', `👽️ Taking 10 seconds sleep at ${counter}.`, '\n');
      await sleep(10000);
    }
  }

  if (counter === data.length) {
    console.info('\x1b[33m%s\x1b[0m', `✅ All ${data.length} deals have been submitted to TFM.`, '\n');
  }

  return Promise.resolve(allTfmDeals);
};

// ******************** MAIN *************************

/**
 * Entry point function.
 * Initiates Deal and Facilities creation and save process.
 * @returns {Boolean} Execution status
 */
const migrate = () => {
  console.info('\n\x1b[33m%s\x1b[0m', `🚀 Initiating ${CONSTANTS.DEAL.DEAL_TYPE.BSS_EWCS} TFM migration v${version}.`, '\n\n');

  getTfmDeals()
    // .then((d) => datafixes(d))
    // .then((d) => tfm(d))
    .then((d) => datafixesTfmDeal(d))
    // .then(() => getTfmDeals())
    // .then((d) => datafixesTfmFacilities(d))
    .then(() => disconnect())
    .then(() => process.exit(1))
    .catch((error) => {
      console.error('\n\x1b[31m%s\x1b[0m', '🚩 Migration failed.\n', { error });
      process.exit(1);
    });
};

migrate();
