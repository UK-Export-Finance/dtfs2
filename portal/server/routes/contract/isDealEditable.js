const {
  STATUS,
  ROLES: { MAKER },
} = require('../../constants');

const isDealEditable = (deal, user) => {
  if (!user.roles.includes(MAKER)) {
    return false;
  }

  const { submissionDate } = deal.details;
  const dealHasBeenSubmitted = submissionDate;

  if (![STATUS.DRAFT, STATUS.CHANGES_REQUIRED].includes(deal.status) || dealHasBeenSubmitted) {
    return false;
  }

  return true;
};

module.exports = isDealEditable;
