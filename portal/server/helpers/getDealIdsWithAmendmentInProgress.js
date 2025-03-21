const { PORTAL_AMENDMENT_INPROGRESS_STATUSES } = require('@ukef/dtfs2-common');
const api = require('../api');
const getUserRoles = require('./getUserRoles');

/**
 * Retrieves deal IDs that have amendments in progress.
 * @returns {Promise<Array<string>>} A promise that resolves to an array of deal IDs with amendments in progress.
 */
const getDealIdsWithAmendmentInprogress = async (user, userToken) => {
  const { isChecker } = getUserRoles(user.roles);
  if (isChecker) {
    const amendments = await api.getAllAmendments({ statuses: PORTAL_AMENDMENT_INPROGRESS_STATUSES, userToken });
    const dealIds = amendments.map((amendment) => amendment.dealId);
    return dealIds;
  }
  return [];
};

module.exports = getDealIdsWithAmendmentInprogress;
