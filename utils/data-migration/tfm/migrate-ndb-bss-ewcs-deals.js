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
const { workflow } = require('../helpers/io');

const version = '0.0.1';

// ******************** WORKFLOW *************************
const raw = async () => {
  const deals = await workflow(CONSTANTS.WORKFLOW.FILES.DEAL);

  deals
    .filter(({ DEAL }) => NON_DELEGATED_BANKS_DEALS.includes(DEAL['UKEF DEAL ID']))
    .map(({ DEAL }, index) => {
    });
};

// ******************** MAIN *************************

/**
 * Entry point function.
 * Initiates Deal and Facilities creation and save process.
 * @returns {Boolean} Execution status
 */
const migrate = () => {
  console.info('\n\x1b[33m%s\x1b[0m', `🚀 Initiating NDB ${CONSTANTS.DEAL.DEAL_TYPE.BSS_EWCS} TFM migration v${version}.`, '\n\n');

  raw()
    .then(() => process.exit(1))
    .catch((error) => {
      console.error('\n\x1b[31m%s\x1b[0m', '🚩 Migration failed.\n', { error });
      process.exit(1);
    });
};

migrate();
