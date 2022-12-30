/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/**
 * DATA MIGRATION
 * **************
 * Purpose of this script is to migrate Non-delegated bank `BSS/EWCS`
 * deals to TFM with myriads of data-fixes from Action Sheets.
 */

const CONSTANTS = require('../constant');

const { NON_DELEGATED_BANKS_DEALS } = CONSTANTS.DEAL;
const { disconnect } = require('../helpers/database');
const { workflow } = require('../helpers/io');
const { tfm } = require('../helpers/create');

const version = '0.0.1';

// ******************** WORKFLOW *************************
/**
 * Extract non-delegated bank workflow deals
 * from the provided exports.
 */
const ndb = async () => {
  if (NON_DELEGATED_BANKS_DEALS && NON_DELEGATED_BANKS_DEALS.length) {
    const d = await workflow(CONSTANTS.WORKFLOW.FILES.DEAL);

    return d
      .filter(({ DEAL }) => NON_DELEGATED_BANKS_DEALS.includes(DEAL['UKEF DEAL ID']));
  }

  throw new Error('Void deal IDs provided.');
};

// ******************** MAIN *************************

/**
 * Entry point function.
 * Initiates Deal and Facilities creation and save process.
 * @returns {Boolean} Execution status
 */
const migrate = () => {
  console.info('\n\x1b[33m%s\x1b[0m', `🚀 Initiating NDB ${CONSTANTS.DEAL.DEAL_TYPE.BSS_EWCS} TFM migration v${version}.`, '\n\n');

  ndb()
    .then((d) => tfm(d))
    .then(() => disconnect())
    .then(() => process.exit(1))
    .catch((error) => {
      console.error('\n\x1b[31m%s\x1b[0m', '🚩 Migration failed.\n', { error });
      process.exit(1);
    });
};

migrate();
