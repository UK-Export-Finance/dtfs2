import { STATUS } from '../../constants';

const isDealEditable = (deal, user) => {
  if (!user.roles.includes('maker')) {
    return false;
  }

  const { submissionDate } = deal.details;
  const dealHasBeenSubmitted = submissionDate;

  if (![STATUS.draft, STATUS.inputRequired].includes(deal.details.status)
      || dealHasBeenSubmitted) {
    return false;
  }

  return true;
};

export default isDealEditable;
