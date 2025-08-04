const {
  ROLES: { MAKER },
} = require('@ukef/dtfs2-common');
const { STATUS } = require('../../constants');

/**
 * Determines if a deal is editable for a given user.
 *
 * @param {object} deal - The deal object.
 * @param {object} user - The user object.
 * @returns {boolean} - True if the deal is editable, false otherwise.
 */
const isDealEditable = (deal, user) => {
  if (!user.roles.includes(MAKER)) {
    return false;
  }

  const { submissionDate } = deal.details;
  const dealHasBeenSubmitted = submissionDate;

  return [STATUS.DEAL.DRAFT, STATUS.DEAL.CHANGES_REQUIRED].includes(deal.status) && !dealHasBeenSubmitted;
};

module.exports = isDealEditable;
