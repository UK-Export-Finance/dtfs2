const { CHECKER, MAKER } = require('../../roles/roles');

const userCanSubmitDeal = (deal, user) => {
  const userRoles = user?.roles;

  if (!userRoles) {
    return false;
  }

  const isMakerCheckerUser = userRoles.includes(MAKER) && userRoles.includes(CHECKER);

  if (!isMakerCheckerUser) {
    return true;
  }

  const makerId = String(deal.maker._id);
  const userId = String(user._id);
  const makerCheckerCreatedTheDeal = makerId === userId;

  if (makerCheckerCreatedTheDeal) {
    return false;
  }

  const makerCheckerEditedTheDeal = deal.editedBy.find((edited) => String(edited.userId) === String(user._id));

  if (makerCheckerEditedTheDeal) {
    return false;
  }

  return true;
};

module.exports = userCanSubmitDeal;
