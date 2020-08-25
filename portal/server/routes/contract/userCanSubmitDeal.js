import STATUS from '../../constants/status';

const userCanSubmitDeal = (deal, user) => {
  if ([STATUS.submitted, STATUS.refused].includes(deal.details.status)) {
    return false;
  }

  const isMakerCheckerUser = (user.roles.includes('maker') && user.roles.includes('checker'));

  if (!isMakerCheckerUser) {
    return true;
  }

  const makerCheckerCreatedTheDeal = (deal.details.maker._id === user._id); // eslint-disable-line no-underscore-dangle

  if (makerCheckerCreatedTheDeal) {
    return false;
  }

  const makerCheckerEditedTheDeal = deal.editedBy.find((edited) =>
    edited.userId === user._id); // eslint-disable-line no-underscore-dangle

  if (makerCheckerEditedTheDeal) {
    return false;
  }

  return true;
};


export default userCanSubmitDeal;
