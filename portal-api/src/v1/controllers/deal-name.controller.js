const { findOneDeal, updateDeal } = require('./deal.controller');
const { userOwns } = require('../users/checks');
const validateNameChange = require('../validation/deal-name');

const updateName = async (dealId, to, user) => {
  const modifiedDeal = {
    updatedAt: Date.now(),
    additionalRefName: to,
  };

  const updatedDeal = await updateDeal(
    dealId,
    modifiedDeal,
    user,
  );

  return updatedDeal;
};

exports.update = (req, res) => {
  const { user } = req;
  const { additionalRefName } = req.body;

  findOneDeal(req.params.id, async (deal) => {
    if (!deal) return res.status(404).send();
    if (!userOwns(user, deal)) return res.status(401).send();

    const validationErrors = validateNameChange(deal, additionalRefName);

    if (validationErrors) {
      return res.status(200).send({
        success: false,
        ...validationErrors,
      });
    }

    const dealAfterAllUpdates = await updateName(
      deal._id,
      additionalRefName,
      req.user,
    );

    return res.status(200).send(dealAfterAllUpdates.additionalRefName);
  });
};
