const { STATUS } = require('../../constants');

const userCanSubmitDeal = (deal, user) => {
  if ([STATUS.DEAL.SUBMITTED_TO_UKEF, STATUS.DEAL.UKEF_REFUSED].includes(deal.status)) {
    return false;
  }

  const userCreatedTheDeal = deal.maker._id === user._id;

  if (userCreatedTheDeal) {
    return false;
  }

  const userEditedTheDeal = deal.editedBy.find((edited) => edited.userId === user._id);

  if (userEditedTheDeal) {
    return false;
  }

  return true;
};

module.exports = userCanSubmitDeal;
