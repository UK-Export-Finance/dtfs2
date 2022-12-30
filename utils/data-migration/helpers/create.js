/* eslint-disable prefer-destructuring */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const { ObjectID } = require('bson');
const CONSTANTS = require('../constant');
const { portalDealInsert, portalFacilityInsert } = require('./database');
const { party, country } = require('./parties');
const { getEpoch } = require('./date');
const { workflow } = require('./io');
const { issued } = require('./facility');

/**
 * Construct deal object for `tfm-deals` collection.
 * @param {Object} workflow Deal workflow object
 * @param {String} dealId Deal Object ID
 * @param {Object} DEAL Workflow DEAL object
 * @param {Boolean} facilitySnapshot Returns facilitySnapshot only
 * @returns {Object} Facility object
 */
const facility = async (data, dealId, DEAL, facilitySnapshot = false) => {
  if (data) {
    const { FACILITY } = data;
    const { facility: f } = CONSTANTS.TEMPLATE;

    // Object ID
    const _id = ObjectID();
    const ukefDealId = data.UKEF_DEAL_ID;
    const ukefFacilityId = FACILITY['UKEF FACILITY ID'];
    f._id = _id;
    f.facilitySnapshot._id = _id;
    f.facilitySnapshot.dealId = dealId;

    // Parties
    const bank = {
      name: await party(ukefDealId, 'BANK'),
      urn: await party(ukefDealId, 'BANK', 1),
    };

    // UKEF Facility ID
    f.facilitySnapshot.ukefFacilityId = ukefFacilityId;

    // Bank
    f.facilitySnapshot.submittedAsIssuedBy = {
      username: DEAL['BANK CONTACT EMAIL ADDRESS'],
      roles: [
        'checker'
      ],
      bank: {
        id: '',
        name: bank.name,
        emails: [
          DEAL['BANK CONTACT EMAIL ADDRESS']
        ],
        companiesHouseNo: '',
        partyUrn: bank.urn
      },
      lastLogin: '',
      firstname: DEAL['BANK CONTACT NAME'].split(' ')[0] ?? '',
      surname: DEAL['BANK CONTACT NAME'].split(' ')[0] ?? '',
      email: DEAL['BANK CONTACT EMAIL ADDRESS'],
      timezone: 'Europe/London',
      'user-status': 'nonactive',
      _id: '',
    };

    // Status
    f.facilitySnapshot.status = CONSTANTS.FACILITY.FACILITY_STATUS_PORTAL.ACKNOWLEDGED;
    f.facilitySnapshot.previousStatus = CONSTANTS.FACILITY.FACILITY_STATUS_PORTAL.ACKNOWLEDGED;
    f.facilitySnapshot.hasBeenIssuedAndAcknowledged = issued(FACILITY.STAGE);
    f.facilitySnapshot.hasBeenAcknowledged = issued(FACILITY.STAGE);
    f.facilitySnapshot.issueFacilityDetailsSubmitted = issued(FACILITY.STAGE);
    f.facilitySnapshot.facilityStage = issued(FACILITY.STAGE) ? 'Issued' : 'Unissued';

    // Value
    f.facilitySnapshot.value = FACILITY['FACILITY VALUE'];
    f.facilitySnapshot.ukefExposure = FACILITY['MAXIMUM LIABILITY'];
    f.tfm.ukefExposure = FACILITY['MAXIMUM LIABILITY'];

    // Other
    f.facilitySnapshot.dayCountBasis = FACILITY['DAY BASIS'];

    // Add `nonDelegatedBank` flag
    f.tfm.nonDelegatedBank = true;

    // Insert into `tfm-deals` collection
    await portalFacilityInsert(f);

    // Return facility object
    return facilitySnapshot ? f.facilitySnapshot : f;
  }

  throw new Error('Void facilities object');
};

/**
 * Construct deal object for `tfm-deals` collection.
 * @param {Object} workflow Deal workflow object
 */
const deal = async (DEAL) => {
  if (DEAL) {
    const { deal: data } = CONSTANTS.TEMPLATE;
    const { deal: tfmDeal } = data;
    const all = await workflow(CONSTANTS.WORKFLOW.FILES.FACILITY);

    // Object ID
    const _id = ObjectID();
    const ukefDealId = DEAL['UKEF DEAL ID'];
    tfmDeal._id = _id;

    // Facilities
    const facilities = all.filter(({ UKEF_DEAL_ID }) => ukefDealId === UKEF_DEAL_ID);

    for (const f of facilities) {
      const snapshot = await facility(f, _id, DEAL, true);
      tfmDeal.dealSnapshot.facilities.push(snapshot);
    }

    // Parties
    const bank = {
      name: await party(ukefDealId, 'BANK'),
      urn: await party(ukefDealId, 'BANK', 1),
    };
    const exporter = {
      name: await party(ukefDealId, 'EXPORTER'),
      urn: await party(ukefDealId, 'EXPORTER', 1),
      party: await party(ukefDealId, 'EXPORTER', -1),
    };
    const buyer = {
      name: await party(ukefDealId, 'BUYER'),
      urn: await party(ukefDealId, 'BUYER', 1),
      party: await party(ukefDealId, 'BUYER', -1),
    };

    const indemnifier = {
      name: await party(ukefDealId, 'INDEMNIFIER'),
      urn: await party(ukefDealId, 'INDEMNIFIER', 1),
      party: await party(ukefDealId, 'INDEMNIFIER', -1),
    };
    const agent = {
      name: await party(ukefDealId, 'AGENT'),
      urn: await party(ukefDealId, 'AGENT', 1),
      party: await party(ukefDealId, 'AGENT', -1),
    };

    // dealSnapshot
    tfmDeal.dealSnapshot._id = _id;
    tfmDeal.dealSnapshot.ukefDealId = ukefDealId;

    // Bank
    tfmDeal.dealSnapshot.bank = {
      id: '',
      name: bank.name,
      emails: [
        DEAL['BANK CONTACT EMAIL ADDRESS']
      ],
      companiesHouseNo: '',
      partyUrn: bank.urn
    };

    // `dealSnapshot.details` and Checker
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
        name: bank.name,
        emails: [
          DEAL['BANK CONTACT EMAIL ADDRESS']
        ],
        companiesHouseNo: '',
        partyUrn: bank.urn
      },
      lastLogin: '',
      firstname: DEAL['BANK CONTACT NAME'].split(' ')[0] ?? '',
      surname: DEAL['BANK CONTACT NAME'].split(' ')[0] ?? '',
      email: DEAL['BANK CONTACT EMAIL ADDRESS'],
      timezone: 'Europe/London',
      'user-status': 'nonactive',
      _id: ''
    };

    // Maker
    tfmDeal.dealSnapshot.maker = {
      username: DEAL['BANK CONTACT EMAIL ADDRESS'],
      roles: [
        'maker'
      ],
      bank: {
        _id: '',
        id: '',
        name: bank.name,
        mga: [
          ''
        ],
        emails: [
          DEAL['BANK CONTACT EMAIL ADDRESS']
        ],
        companiesHouseNo: '',
        partyUrn: bank.urn
      },
      lastLogin: '',
      firstname: DEAL['BANK CONTACT NAME'].split(' ')[0] ?? '',
      surname: DEAL['BANK CONTACT NAME'].split(' ')[1] ?? '',
      email: DEAL['BANK CONTACT EMAIL ADDRESS'],
      timezone: 'Europe/London',
      'user-status': 'nonactive',
      _id: ''
    };

    // submissionDetails
    tfmDeal.dealSnapshot.submissionDetails = {
      ...tfmDeal.submissionDetails,
      status: 'Complete',
      'supplier-companies-house-registration-number': '',
      'supplier-name': exporter.name,
      'supplier-address-country': {
        name: exporter.party.COUNTRY_OF_BUSINESS,
        code: country(exporter.party.COUNTRY_OF_BUSINESS),
      },
      'supplier-address-line-1': exporter.party.ADDRESS_LINE1,
      'supplier-address-line-2': exporter.party.ADDRESS_LINE2,
      'supplier-address-line-3': exporter.party.ADDRESS_LINE3,
      'supplier-address-town': exporter.party.ADDRESS_LINE4,
      'supplier-address-postcode': '',
      'supplier-correspondence-address-is-different': 'false',
      'supplier-correspondence-address-country': {},
      'supplier-correspondence-address-line-1': '',
      'supplier-correspondence-address-line-2': '',
      'supplier-correspondence-address-line-3': '',
      'supplier-correspondence-address-town': '',
      'supplier-correspondence-address-postcode': '',
      'indemnifier-companies-house-registration-number': '',
      'indemnifier-name': indemnifier.name,
      'indemnifier-address-country': {
        name: indemnifier.party ? indemnifier.party.COUNTRY_OF_BUSINESS : '',
        code: indemnifier.party ? country(indemnifier.party.COUNTRY_OF_BUSINESS) : '',
      },
      'indemnifier-address-line-1': indemnifier.party ? indemnifier.party.ADDRESS_LINE1 : '',
      'indemnifier-address-line-2': indemnifier.party ? indemnifier.party.ADDRESS_LINE2 : '',
      'indemnifier-address-line-3': indemnifier.party ? indemnifier.party.ADDRESS_LINE3 : '',
      'indemnifier-address-town': indemnifier.party ? indemnifier.party.ADDRESS_LINE4 : '',
      'indemnifier-address-postcode': '',
      'indemnifier-correspondence-address-country': {},
      'indemnifier-correspondence-address-line-1': '',
      'indemnifier-correspondence-address-line-2': '',
      'indemnifier-correspondence-address-line-3': '',
      'indemnifier-correspondence-address-town': '',
      'indemnifier-correspondence-address-postcode': '',
      indemnifierCorrespondenceAddressDifferent: 'false',
      'buyer-name': buyer.name,
      'buyer-address-country': {
        name: buyer.party.COUNTRY_OF_BUSINESS,
        code: country(buyer.party.COUNTRY_OF_BUSINESS),
      },
      'buyer-address-line-1': buyer.party.ADDRESS_LINE1,
      'buyer-address-line-2': buyer.party.ADDRESS_LINE2,
      'buyer-address-line-3': buyer.party.ADDRESS_LINE3,
      'buyer-address-town': buyer.party.ADDRESS_LINE4,
      'buyer-address-postcode': '',
      destinationOfGoodsAndServices: {
        name: buyer.party.COUNTRY_OF_BUSINESS,
        code: country(buyer.party.COUNTRY_OF_BUSINESS),
      },
    };

    // Timestamps
    tfmDeal.dealSnapshot.updatedAt.$numberLong = getEpoch(DEAL['DATE LAST UPDATED DATETIME']);
    tfmDeal.dealSnapshot.facilitiesUpdated.$numberLong = getEpoch(DEAL['DATE LAST UPDATED DATETIME']);
    tfmDeal.tfm.dateReceived = DEAL['DATE LAST UPDATED DATETIME'].split('T')[0];
    tfmDeal.tfm.dateReceivedTimestamp = getEpoch(DEAL['DATE LAST UPDATED DATETIME']);
    tfmDeal.tfm.lastUpdated.$numberLong = getEpoch(DEAL['DATE LAST UPDATED DATETIME']);

    // Parties
    tfmDeal.tfm.parties = {
      exporter: {
        partyUrn: exporter.urn,
        partyUrnRequired: true
      },
      buyer: {
        partyUrn: buyer.urn,
        partyUrnRequired: true
      },
      indemnifier: {
        partyUrn: indemnifier.urn,
        partyUrnRequired: Boolean(indemnifier.urn)
      },
      agent: {
        partyUrn: agent.urn,
        partyUrnRequired: Boolean(agent.urn),
        commissionRate: ''
      }
    };

    // `dealSnapshot.exporter.companyName`
    tfmDeal.dealSnapshot.exporter.companyName = await party(ukefDealId, 'EXPORTER');

    // Product
    tfmDeal.dealSnapshot.exporter.dealType = CONSTANTS.DEAL.DEAL_TYPE.BSS_EWCS;
    tfmDeal.tfm.product = CONSTANTS.DEAL.DEAL_TYPE.BSS_EWCS;

    // Type
    tfmDeal.dealSnapshot.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.MIN;

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
 * Converts workflow deal and facilities into TFM deal and facilities.
 * @param {Array} deals array of workflow deals object
 */
const tfm = async (deals) => {
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
  tfm,
};
