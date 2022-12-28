/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const { ObjectID } = require('bson');
const CONSTANTS = require('../constant');
const { portalDealInsert } = require('./database');

/**
 * Construct deal object for `tfm-deals` collection.
 * @param {Object} workflow Deal workflow object
 */
const deal = async (DEAL) => {
  if (DEAL) {
    const { tfm } = CONSTANTS.TEMPLATE;
    const { deal: tfmDeal } = tfm;

    // 1. Object ID
    const _id = ObjectID();
    tfmDeal._id = _id;
    tfmDeal.dealSnapshot._id = _id;
    tfmDeal.tfm.acbs.portalDealId = _id;

    // 2. UKEF Deal ID
    tfmDeal.dealSnapshot.ukefDealId = DEAL['UKEF DEAL ID'];
    tfmDeal.tfm.acbs.ukefDealId = DEAL['UKEF DEAL ID'];

    // Add `nonDelegatedBank` flag
    tfmDeal.tfm.nonDelegatedBank = true;

    // Insert into `tfm-deals` collection
    await portalDealInsert(tfmDeal);

    // Return Promise
    return Promise.resolve(true);
  }

  throw new Error('Void deal object');
};

/**
 * Converts workflow deal into TFM deal.
 * @param {Array} deals array of workflow deals object
 */
const submitTfmDeals = async (deals) => {
  let counter = 0;

  if (deals && deals.length) {
    for (const data of deals) {
        const { DEAL } = data;
      await deal(DEAL)
        .then((r) => {
          if (r) {
            counter += 1;
          }
        });
    }

    if (counter === deals.length) {
      console.info('\x1b[33m%s\x1b[0m', `✅ All ${counter} NDB deals have been submitted to TFM.`, '\n');
      return Promise.resolve(true);
    }

    return Promise.reject();
  }

  throw new Error('Void argument');
};

module.exports = {
  submitTfmDeals,
};
