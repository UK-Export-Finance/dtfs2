/**
 * DATA MIGRATION
 * **************
 * Purpose of this script is to migrate GEF deals to TFM.
 * Since GEF deals are not subjected to execution on Workflow.
 */
const {
  getCollection,
  disconnect,
} = require('../helpers/database');
const {
  getDDMMYYYY,
  epochInSeconds,
} = require('../helpers/date');
const {
  getDealTfmStage,
} = require('../helpers/deal');
const { ObjectId } = require('mongodb');
const CONSTANTS = require('../constant');

const version = '0.0.1';

// ******************** DEALS *************************

/**
 * Return all the portal deals, without (default) or with filter specified.
 * @param {Object} filter Mongo filter
 * @returns {Object} Collection object
 */
const getDeals = (filter = null) => getCollection(CONSTANTS.DATABASE.TABLES.DEAL, filter);

/**
 * Returns all TFM deals.
 * @param {Object} filter Mongo filter
 * @returns {Object} Collection object
 */
const getTfmDeals = (filter = null) => getCollection(CONSTANTS.DATABASE.TABLES.TFM_DEAL, filter);

/**
 * Save deal to `tfm-deals` collection.
 * @param {Object} deal Deal object
 * @returns {Boolean} Execution status
 */
const setTfmDeal = (deal) => new Promise((response, reject) => {
  getCollection(CONSTANTS.DATABASE.TABLES.TFM_DEAL, null, true)
    .then((collection) => collection.insertOne(deal))
    .then((result) => response(result))
    .catch((error) => reject(error));
});

/**
 * Construct deal's `dealSnapshot` object.
 * @param {Object} deal Deal object
 * @returns {Object} dealSnapshot Deal snapshot
 */
const buildDealsnapshot = (deal) => (
  {
    dealSnapshot: {
      ...deal,
    }
  }
);

/**
 * Construct deal's `tfm` object.
 * @param {Object} deal Deal object
 * @returns {Object} tfm TFM Object
 */
const buildDealTfm = (deal) => (
  {
    tfm: {
      dateReceived: getDDMMYYYY(deal.submissionDate),
      dateReceivedTimestamp: epochInSeconds(deal.submissionDate),
      product: deal.dealType,
      stage: getDealTfmStage(deal),
      lossGivenDefault: CONSTANTS.DEAL.LOSS_GIVEN_DEFAULT.DEFAULT,
      exporterCreditRating: '',
      probabilityOfDefault: '',
      lastUpdated: 0,
      activities: [],
      tasks: [],
      parties: {
        exporter: {
          partyUrn: '',
          partyUrnRequired: true
        },
        buyer: {
          partyUrn: '',
          partyUrnRequired: false
        },
        indemnifier: {
          partyUrn: '',
          partyUrnRequired: false
        },
        agent: {
          partyUrn: '',
          partyUrnRequired: false
        }
      },
      estore: {
        siteName: 0
      }
    }
  }
);

/**
 * Initiates object creation and save for all the deal to
 * `tfm-deals` collection.
 * @returns {Boolean} Execution status
 */
const createTfmDeal = async () => {
  console.info('\x1b[33m%s\x1b[0m', '➕ 1. Deals', '\n');

  let counter = 0;
  let object;
  const filter = {
    dealType: CONSTANTS.DEAL.DEAL_TYPE.GEF,
  };

  return getDeals(filter)
    .then(async (deals) => {
      const insertions = deals.map(async (deal) => {
        const dealSnapshot = buildDealsnapshot(deal);
        const tfm = buildDealTfm(deal);

        object = {
          _id: ObjectId(deal._id),
          ...dealSnapshot,
          ...tfm,
        };

        await setTfmDeal(object)
          .then((inserted) => {
            if (!inserted) {
              console.error('\x1b[31m%s\x1b[0m', `🚩 Failed ${counter}/${deals.length}`);
            } else {
              counter += 1;
              console.info('\x1b[33m%s\x1b[0m', `✅ Inserted ${counter}/${deals.length}`);
            }
            return Promise.resolve(inserted);
          })
          .catch(() => {
            console.error('\x1b[31m%s\x1b[0m', `🚩 Error inserting deal ${deal._id}`);
            return Promise.reject(new Error(`Error inserting deal ${deal._id}`));
          });
      });

      return Promise.all(insertions)
        .then(() => Promise.resolve(counter))
        .catch((e) => Promise.reject(e));
    })
    .catch((e) => Promise.reject(e));
};

// ******************** FACILITIES *************************

// ******************** MAIN *************************

/**
 * Entry point function.
 * Initiates Deal and Facilities creation and save process.
 * @returns {Boolean} Execution status
 */
const migrate = () => {
  console.info('\n\x1b[33m%s\x1b[0m', `🚀 Initiating GEF TFM migration v${version}.`, '\n\n');

  createTfmDeal()
    .then((result) => {
      if (result) console.info('\n\x1b[32m%s\x1b[0m', `✅ Successfully inserted ${result} TFM deals.\n`);
    })
    .then(() => disconnect())
    .then(() => process.exit(1))
    .catch((error) => {
      console.error('\n\x1b[31m%s\x1b[0m', '🚩 Migration failed.\n', error);
      process.exit(1);
    });
};

migrate();
