const { ACTIVITY_TYPES } = require('@ukef/dtfs2-common');

const CONSTANTS = require('../../constants');
const api = require('../api');

let acbsResponse;

/**
 * Returns formatted label case string
 * @param {string} label Unformatted string
 * @returns {string} Formatted label case string
 */
const labelCase = (label) => label.charAt(0).toUpperCase() + label.substring(1).toLowerCase();

/**
 * Returns ACBS record creation timestamp in UNIX EPOCH
 * without the milliseconds.
 * @param {object} record ACBS response object
 * @returns {number} EPOCH time without the milliseconds
 */
const getTimestamp = (record) => new Date(record.receivedFromACBS).valueOf() / 1000;

/**
 * Returns activity compatible author object
 * @param {object} Deal Deal object
 * @returns {object} Author object
 */
const getAuthor = (deal) => ({
  firstName: deal.dealSnapshot.bank.name,
  lastName: deal.dealSnapshot.bank.id,
  _id: '',
});

/**
 * Returns user specific latest comment
 * @param {object} role User role
 * @param {object} Deal Deal object
 * @returns {string} User specific comments
 */
const getComments = (role, deal) => {
  if (deal.dealSnapshot.dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS && deal.dealSnapshot.comments) {
    const comments = deal.dealSnapshot.comments.filter((comment) => comment.user.roles.includes(role));
    if (comments.length > 0) {
      return comments[comments.length - 1].text;
    }
  }

  if (deal.dealSnapshot.dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF && deal.dealSnapshot.comments) {
    const comments = deal.dealSnapshot.comments.filter((comment) => comment.roles.includes(role));
    if (comments.length > 0) {
      return comments[comments.length - 1].comment;
    }
  }
  return '';
};

/**
 * Returns appropriate activity description from the checker
 * @param {object} record ACBS response object
 * @param {object} Deal Deal object
 * @returns {string} Description
 */
const getDescription = (record, deal) => {
  if (record.dealIdentifier) {
    return getComments(CONSTANTS.ACTIVITY.ROLE.CHECKER, deal);
  }
  return '';
};

/**
 * Returns appropriate activity label
 * @param {object} record ACBS response object
 * @param {object} Deal Deal object
 * @returns {string} Label string
 */
const getLabel = (record, deal) => {
  const dealType = labelCase(deal.dealSnapshot.submissionType);

  if (record.dealIdentifier) {
    return `${dealType} submitted`;
  }
  if (record.facilityIdentifier) {
    return 'Facility submitted';
  }
  return '';
};

/**
 * Constructs activity object
 * @param {object} record ACBS response object
 * @param {object} Deal Deal object
 * @returns {object} Activity object
 */
const getObject = (record, deal) => ({
  type: ACTIVITY_TYPES.ACTIVITY,
  timestamp: getTimestamp(record),
  author: getAuthor(deal),
  text: getDescription(record, deal),
  label: getLabel(record, deal),
});

/**
 * Constructs ACBS records activities
 * @param {object} Deal Deal object
 * @returns {Array} An array of activities object
 */
const getActivities = (deal) => {
  try {
    const activities = [];
    // Add deal activity object to the array
    if (acbsResponse.deal) {
      activities.push(getObject(acbsResponse.deal.deal, deal));
    }

    // Add facility(ies) object(s) to the array
    if (acbsResponse.facilities.length > 0) {
      acbsResponse.facilities.forEach((facility) => {
        if (facility.facilityMaster) {
          activities.push(getObject(facility.facilityMaster, deal));
        }
      });
    }
    return activities;
  } catch (error) {
    console.error('Error creating activity object. %o', error);
  }
  return {};
};

/**
 * Return array of activities object, comprising of
 * ACBS interaction records
 * @param {object} acbs Durable function output
 * @returns {Promise<Object[] | {}>} An array of activities object
 */
const add = async (acbs) => {
  if (acbs.portalDealId) {
    acbsResponse = acbs;
    const deal = await api.findOneDeal(acbs.portalDealId);
    if (deal) {
      return getActivities(deal);
    }
    console.error('Unable to get deal %s for activities.', acbs.portalDealId);
  }
  return {};
};

module.exports = {
  labelCase,
  getLabel,
  getTimestamp,
  getDescription,
  getAuthor,
  add,
};
