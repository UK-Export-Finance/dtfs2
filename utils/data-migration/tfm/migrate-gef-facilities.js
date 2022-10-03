/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/**
 * DATA MIGRATION
 * **************
 * Purpose of this script is to migrate `GEF` deals to TFM
 * with myriads of data-fixes.
 *
 * `GEF` TFM data has been provided from Action sheets.
 */

const CONSTANTS = require('../constant');
const { getCollection, disconnect } = require('../helpers/database');
const { datafixesFacilities } = require('../helpers/datafixes');

const version = '0.0.1';

/**
  * Return all the portal facilities, without (default) or with filter specified.
  * @param {Object} filter Mongo filter
  * @returns {Object} Collection object
  */
const getFacilities = (filter = null) => getCollection(CONSTANTS.DATABASE.TABLES.FACILITIES, filter);

/**
  * Extracts deals from `facilities` collection with following filters
  * 1. type: Cash
  * 2. or type: Contingent
  * @returns {Promise} Response on success, Reject upon a failure.
  */
const facilities = async () => {
  console.info('\x1b[33m%s\x1b[0m', `➕ 1. Fetching all ${CONSTANTS.DEAL.DEAL_TYPE.GEF} deals`, '\n');

  /**
    * OR condition
    * 1. Cash facility
    * 2. or contingent facility
    */
  const filter = {
    $or: [{ type: CONSTANTS.FACILITY.FACILITY_TYPE.CASH }, { type: CONSTANTS.FACILITY.FACILITY_TYPE.CONTINGENT }],
  };

  return getFacilities(filter)
    .then((data) => {
      if (data && data.length > 0) {
        console.info('\x1b[33m%s\x1b[0m', `✅ ${data.length} facilities fetched.`, '\n');
        return Promise.resolve(data);
      }

      return Promise.reject(new Error('Empty data set'));
    })
    .catch((e) => Promise.reject(new Error(`poral facilities fetch failed ${e}`)));
};

/**
  * Entry point function.
  * Initiates facilities creation and applies data fixes process.
  * @returns {Boolean} Execution status
  */
const migrate = () => {
  console.info('\n\x1b[33m%s\x1b[0m', `🚀 Initiating ${CONSTANTS.DEAL.DEAL_TYPE.GEF} portal facility migration v${version}.`, '\n\n');

  facilities()
    .then((f) => datafixesFacilities(f, 'GEF'))
    .then(() => disconnect())
    .then(() => process.exit(1))
    .catch((error) => {
      console.error('\n\x1b[31m%s\x1b[0m', '🚩 Migration failed.\n', { error });
      process.exit(1);
    });
};

migrate();
