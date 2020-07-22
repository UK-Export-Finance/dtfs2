const userCanSubmitDeal = (deal, user) => {
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
