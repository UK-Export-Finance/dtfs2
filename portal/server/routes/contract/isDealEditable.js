const { STATUS } = require('../../constants');

const isDealEditable = (deal) => {
  const { submissionDate } = deal.details;
  const dealHasBeenSubmitted = submissionDate;

  if (![STATUS.DRAFT, STATUS.CHANGES_REQUIRED].includes(deal.status)
      || dealHasBeenSubmitted) {
    return false;
  }

  return true;
};

module.exports = isDealEditable;
