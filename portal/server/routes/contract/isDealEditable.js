const { STATUS } = require('../../constants');
const { MAKER } = require('../../constants/roles');

const isDealEditable = (deal, user) => {
  if (!user.roles.includes(MAKER)) {
    return false;
  }

  const { submissionDate } = deal.details;
  const dealHasBeenSubmitted = submissionDate;

  if (![STATUS.DEAL.DRAFT, STATUS.DEAL.CHANGES_REQUIRED].includes(deal.status)
      || dealHasBeenSubmitted) {
    return false;
  }

  return true;
};

module.exports = isDealEditable;
