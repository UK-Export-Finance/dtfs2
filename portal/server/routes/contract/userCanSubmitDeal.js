import STATUS from '../../constants/status';

const userCanSubmitDeal = (deal, user) => {
  if ([STATUS.submitted, STATUS.refused].includes(deal.details.status)) {
    return false;
  }

  const userCreatedTheDeal = (deal.details.maker._id === user._id); // eslint-disable-line no-underscore-dangle

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


export default userCanSubmitDeal;
