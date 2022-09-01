/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/**
 * DATA MIGRATION
 * **************
 * Purpose of this script is to migrate `BSS/EWCS` deals to TFM.
 */
const fs = require('fs');
const axios = require('axios');
const CONSTANTS = require('../constant');
const { getCollection, disconnect, update } = require('../helpers/database');
const { sleep } = require('../helpers/io');

const version = '0.0.1';
const { TFM_API } = process.env;

// ******************** DEALS *************************

/**
 * Return all the portal deals, without (default) or with filter specified.
 * @param {Object} filter Mongo filter
 * @returns {Object} Collection object
 */
const getDeals = (filter = null) => getCollection(CONSTANTS.DATABASE.TABLES.DEAL, filter);

/**
 * Updates TFM deal with provided updates object.
 * @param {String} ukefDealId UKEF Deal ID
 * @param {Object} updates Updates object in JSON
 * @returns {Promise} Resolve if successful otherwise Reject
 */
const setTfmDeal = (ukefDealId, updates) => update(CONSTANTS.DATABASE.TABLES.TFM_DEAL, ukefDealId, updates);

/**
 * Submits deal to the TFM as a `Checker` from `UKEF test bank (Delegated)`
 * for following deals:
 * 1. Deal Type: `BSS/EWCS`
 * 2. Property exists check: `dataMigration`
 * @returns {Promise} Response on success, Reject upon a failure.
 */
const submitTfmDeal = async () => {
  console.info('\x1b[33m%s\x1b[0m', '➕ 1. Creating deals', '\n');

  let counter = 0;
  /**
   * AND condition
   * 1. Deal type : BSS/EWCS
   * 2. Property exists : dataMigration
   */
  const filter = {
    $and: [{ dealType: CONSTANTS.DEAL.DEAL_TYPE.BSS_EWCS }, { dataMigration: { $exists: true } }],
  };
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
    firstname: 'Abhi',
    surname: 'Markan',
    email: 'checker1@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    'user-status': 'active',
    _id: '627b70305ac41e001d37294a',
  };

  return getDeals(filter)
    .then(async (deals) => {
      for (const deal of deals) {
        axios({
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
              console.info('\x1b[33m%s\x1b[0m', `✅ Inserted ${counter}/${deals.length}`);
              Promise.resolve(inserted);
            } else {
              Promise.reject(new Error('\x1b[31m%s\x1b[0m', `🚩 Error inserting deal ${inserted}`));
            }
          })
          .catch((error) => Promise.reject(new Error(`🚩 Error inserting deal ${error}`)));

        await sleep(1000);
      }
    })
    .catch((e) => Promise.reject(e));
};

/**
 * Updates `tfm-deals` collection with update object.
 * @param {String} ukefDealId UKEF Deal ID
 * @param {Object} update Object comprising of updates to be applied
 * @returns {Promise} Resolve is success, otherwise Reject accompanied with an error message.
 */
const updateTfmDeal = (ukefDealId, updates) => {
  try {
    return setTfmDeal(ukefDealId, updates)
      .then((r) => Promise.resolve(r))
      .catch((e) => Promise.reject(new Error(e)));
  } catch (e) {
    return Promise.reject(new Error(`🚩 Unable to update deal TFM ${ukefDealId} ${e}`));
  }
};

// ******************** WORKFLOW / K2 *************************

const workflow = async () => {
  console.info('\x1b[33m%s\x1b[0m', '➕ 2. Extracting data from Workflow', '\n');
  const path = './json';
  const results = [];

  try {
    const files = fs.readdirSync(path);

    await files.forEach((file) => {
      const uri = `${path}/${file}`;
      const data = fs.readFileSync(uri, 'utf8');

      if (data) {
        const json = JSON.parse(data);
        const deals = json.Workflow;

        deals.map((deal) => {
          console.info(deal);
        });
      } else {
        return Promise.reject(new Error(`🚩 Empty workflow data set ${uri}`));
      }
    });

    return Promise.resolve(results);
  } catch (e) {
    return Promise.reject(new Error(`🚩 Unable to read the workflow directory ${e}`));
  }
};

// ******************** MAIN *************************

/**
 * Entry point function.
 * Initiates Deal and Facilities creation and save process.
 * @returns {Boolean} Execution status
 */
const migrate = () => {
  console.info('\n\x1b[33m%s\x1b[0m', `🚀 Initiating BSS/EWCS TFM migration v${version}.`, '\n\n');

  // submitTfmDeal()
  //   .then((r) => {
  //     if (r) console.info('\n\x1b[32m%s\x1b[0m', `✅ Successfully inserted ${r} TFM deals.\n`);
  //   })
  // //   .then(() => workflow())
  workflow()
    .then(() => disconnect())
    .then(() => process.exit(1))
    .catch((error) => {
      console.error('\n\x1b[31m%s\x1b[0m', '🚩 Migration failed.\n', { error });
      process.exit(1);
    });
};

migrate();
