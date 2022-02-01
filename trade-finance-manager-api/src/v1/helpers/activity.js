const CONSTANTS = require('../../constants');
const api = require('../api');

let acbsResponse;
let deal;

/**
 * Returns formatted label case string
 * @param {String} label Unformatted string
 * @returns {String} Formatted label case string
 */
const labelCase = (label) => label.charAt(0).toUpperCase() + label.substring(1).toLowerCase();

/**
 * Returns ACBS record creation timestamp in UNIX EPOCH
 * wihtout the milliseconds.
 * @param {Object} record ACBS response object
 * @returns {Integer} EPOCH time without the milliseconds
 */
const getTimestamp = (record) => (new Date(record.receivedFromACBS).valueOf()) / 1000;

/**
 * Returns activity compatible author object
 * @returns {Object} Author object
 */
const getAuthor = () => ({
  firstName: deal.dealSnapshot.bank.name,
  lastName: deal.dealSnapshot.bank.id,
  _id: '',
});

/**
 * Returns user specific latest comment
 * @param {Object} role User role
 * @returns {String} User specific comments
 */
const getComments = (role) => {
  if (deal.dealSnapshot.dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS && deal.dealSnapshot.comments) {
    const comments = deal.dealSnapshot.comments.filter((comment) => comment.user.roles.includes(role));
    if (comments.length > 0) {
      return comments[0].text;
    }
  }

  if (deal.dealSnapshot.dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF && deal.dealSnapshot.comments) {
    const comments = deal.dealSnapshot.comments.filter((comment) => comment.role === role);
    if (comments.length > 0) {
      return comments[0].comment;
    }
  }
  return '';
};

/**
 * Returns appropriate activity description from the checker
 * @param {Object} record ACBS response object
 * @returns {String} Description
 */
const getDescription = (record) => {
  if (record.dealIdentifier) {
    return getComments(CONSTANTS.ACTIVITY.ROLE.CHECKER);
  }
  return '';
};

/**
 * Returns appropriate activity label
 * @param {Object} record ACBS response object
 * @returns {String} Label string
 */
const getLabel = (record) => {
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
 * @param {Object} record ACBS response object
 * @returns {Object} Activity object
 */
const getObject = (record) => ({
  type: CONSTANTS.ACTIVITY.TYPE.ACTIVITY,
  timestamp: getTimestamp(record),
  author: getAuthor(),
  text: getDescription(record),
  label: getLabel(record),
});

/**
 * Constructs ACBS records activities
 * @returns {Array} An array of activites object
 */
const getActivities = async () => {
  try {
    const activites = [];
    // Add deal activity object to the array
    if (acbsResponse.deal) {
      activites.push(getObject(acbsResponse.deal.deal));
    }

    // Add facility(ies) object(s) to the array
    if (acbsResponse.facilities.length > 0) {
      acbsResponse.facilities.forEach(({ facilityMaster }) => activites.push(getObject(facilityMaster)));
    }
    return activites;
  } catch (error) {
    console.error('Error creating activity object.', { error });
  }
  return {};
};

/**
 * Return array of activities object, comprising of
 * ACBS interaction records
 * @param {Object} acbs Durable function output
 * @returns {Array} An array of activities object
 */
const add = async (acbs) => {
  if (acbs) {
    acbsResponse = acbs;
    deal = await api.findOneDeal(acbs.portalDealId);
    if (deal) {
      return getActivities();
    }
    console.error(`Unable to get deal ${acbs.portalDealId} for activites.`);
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
