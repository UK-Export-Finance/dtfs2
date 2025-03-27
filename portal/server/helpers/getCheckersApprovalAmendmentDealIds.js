const { PORTAL_AMENDMENT_STATUS } = require('@ukef/dtfs2-common');
const api = require('../api');

/**
 * Retrieves deal IDs that have amendments status ready for checker's approval.
 * @param {string} userToken - A valid user token.
 * @returns {Promise<Array<string>>} A promise that resolves to an array of deal IDs with amendments in progress.
 */
const getCheckersApprovalAmendmentDealIds = async (userToken) => {
  try {
    const statuses = [PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL];

    const amendments = await api.getAllAmendments({ statuses, userToken });
    const dealIds = amendments.map((amendment) => amendment.dealId);

    return dealIds;
  } catch (error) {
    console.error("Failed to get amendments for checker's approval %o", error);
    throw new Error(error);
  }
};

module.exports = getCheckersApprovalAmendmentDealIds;
