const { PORTAL_AMENDMENT_UNDERWAY_STATUSES } = require('@ukef/dtfs2-common');
const api = require('../api');
const getUserRoles = require('./getUserRoles');

/**
 * Retrieves deal IDs that have amendments currently underway.
 * @returns {Promise<Array<string>>} A promise that resolves to an array of deal IDs with amendments underway.
 */
const getDealIdsWithAmendmentsUnderway = async (user, userToken) => {
  const { isChecker } = getUserRoles(user.roles);
  if (isChecker) {
    const amendments = await api.getAllAmendments({ statuses: PORTAL_AMENDMENT_UNDERWAY_STATUSES, userToken });
    const dealIds = amendments.map((amendment) => amendment.dealId);
    return dealIds;
  }
  return [];
};

module.exports = getDealIdsWithAmendmentsUnderway;
