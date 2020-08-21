import STATUS from '../../constants/status';

const isDealEditable = (deal, user) => {
  if (!user.roles.includes('maker')) {
    return false; // only makers can edit a deal
  }

  if (![STATUS.draft, STATUS.inputRequired].includes(deal.details.status)) {
    return false; // can only edit deals in these statuses..
  }

  return true; // otherwise all good..
};

export default isDealEditable;
