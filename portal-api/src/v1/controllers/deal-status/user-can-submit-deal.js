const userCanSubmitDeal = (deal, user) => {
  const isMakerCheckerUser = (user.roles.includes('maker') && user.roles.includes('checker'));

  if (!isMakerCheckerUser) {
    return true;
  }

  const makerId = String(deal.maker._id);
  const userId = String(user._id);
  const makerCheckerCreatedTheDeal = (makerId === userId);

  if (makerCheckerCreatedTheDeal) {
    return false;
  }

  const makerCheckerEditedTheDeal = deal.editedBy.find((edited) =>
    String(edited.userId) === String(user._id));

  if (makerCheckerEditedTheDeal) {
    return false;
  }

  return true;
};

module.exports = userCanSubmitDeal;
