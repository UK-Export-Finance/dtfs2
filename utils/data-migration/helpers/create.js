/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const { ObjectID } = require('bson');
const CONSTANTS = require('../constant');
const { portalDealInsert } = require('./database');
const { party } = require('./parties');
const { getEpoch } = require('./date');

/**
 * Construct deal object for `tfm-deals` collection.
 * @param {Object} workflow Deal workflow object
 */
const deal = async (DEAL) => {
  if (DEAL) {
    const { tfm } = CONSTANTS.TEMPLATE;
    const { deal: tfmDeal } = tfm;

    // Object ID
    const _id = ObjectID();
    const ukefDealId = DEAL['UKEF DEAL ID'];
    tfmDeal._id = _id;

    // dealSnapshot
    tfmDeal.dealSnapshot._id = _id;
    tfmDeal.dealSnapshot.ukefDealId = ukefDealId;

    // `dealSnapshot.details`
    tfmDeal.dealSnapshot.details.created.$numberLong = getEpoch(DEAL['DATE CREATED DATETIME']);
    tfmDeal.dealSnapshot.details.submissionDate = getEpoch(DEAL['DATE LAST UPDATED DATETIME']);
    tfmDeal.dealSnapshot.details.submissionCount = 2;
    tfmDeal.dealSnapshot.details.ukefDealId = ukefDealId;
    tfmDeal.dealSnapshot.details.checker = {
      username: DEAL['BANK CONTACT EMAIL ADDRESS'],
      roles: [
        'checker'
      ],
      bank: {
        id: '',
        name: await party(ukefDealId, 'BANK'),
        emails: [
          DEAL['BANK CONTACT EMAIL ADDRESS']
        ],
        companiesHouseNo: '',
        partyUrn: await party(ukefDealId, 'BANK', 1)
      },
      lastLogin: '',
      firstname: DEAL['BANK CONTACT NAME'].split(' ')[0] ?? '',
      surname: DEAL['BANK CONTACT NAME'].split(' ')[0] ?? '',
      email: DEAL['BANK CONTACT EMAIL ADDRESS'],
      timezone: 'Europe/London',
      'user-status': 'nonactive',
      _id: ''
    };

    // `dealSnapshot.exporter.companyName`
    tfmDeal.dealSnapshot.exporter.companyName = await party(ukefDealId, 'EXPORTER');

    // Product
    tfmDeal.dealSnapshot.exporter.dealType = CONSTANTS.DEAL.DEAL_TYPE.BSS_EWCS;
    tfmDeal.tfm.product = CONSTANTS.DEAL.DEAL_TYPE.BSS_EWCS;

    // Type
    tfmDeal.dealSnapshot.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.MIN;

    // `dealSnapshot.bank`
    tfmDeal.dealSnapshot.bank = {
      id: '',
      name: await party(ukefDealId, 'BANK'),
      emails: [
        DEAL['BANK CONTACT EMAIL ADDRESS']
      ],
      companiesHouseNo: '',
      partyUrn: await party(ukefDealId, 'BANK', 1)
    };

    // References
    tfmDeal.dealSnapshot.bankInternalRefName = DEAL['BUYER NAME'];
    tfmDeal.dealSnapshot.additionalRefName = DEAL['BUYER NAME'];

    // Status
    tfmDeal.dealSnapshot.status = CONSTANTS.DEAL.PORTAL_STATUS.SUBMITTED_TO_UKEF;
    tfmDeal.dealSnapshot.previousStatus = CONSTANTS.DEAL.PORTAL_STATUS.UKEF_ACKNOWLEDGED;
    tfmDeal.tfm.stage = CONSTANTS.DEAL.TFM_STATUS.CONFIRMED;

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
