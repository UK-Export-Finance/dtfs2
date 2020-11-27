import STATUS from '../../constants/status';

const userCanSubmitDeal = (deal, user) => {
  const hasInvalidDealStatus = [STATUS.submitted, STATUS.refused].includes(deal.details.status);

  const userCreatedTheDeal = (deal.details.maker._id === user._id); // eslint-disable-line no-underscore-dangle

  const userEditedTheDeal = deal.editedBy.find((edited) =>
    edited.userId === user._id); // eslint-disable-line no-underscore-dangle

  return {
    hasInvalidDealStatus,
    userCreatedTheDeal,
    userEditedTheDeal,
  };
};


export default userCanSubmitDeal;
