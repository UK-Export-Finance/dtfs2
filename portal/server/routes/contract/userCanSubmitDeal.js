const { STATUS } = require('../../constants');

const userCanSubmitDeal = (deal, user) => {
  if ([STATUS.SUBMITTED, STATUS.REFUSED].includes(deal.status)) {
    return false;
  }

  const userCreatedTheDeal = (deal.maker._id === user._id); // eslint-disable-line no-underscore-dangle

  if (userCreatedTheDeal) {
    return false;
  }

  const userEditedTheDeal = deal.editedBy.find((edited) =>
    edited.userId === user._id); // eslint-disable-line no-underscore-dangle

  if (userEditedTheDeal) {
    return false;
  }

  return true;
};

module.exports = userCanSubmitDeal;
