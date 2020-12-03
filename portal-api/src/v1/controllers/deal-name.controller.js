const $ = require('mongo-dot-notation');
const { findOneDeal } = require('./deal.controller');
const { userOwns } = require('../users/checks');
const db = require('../../drivers/db-client');
const validateNameChange = require('../validation/deal-name');
const now = require('../../now');

const updateName = async (collection, deal, to) => {
  const update = {
    details: {
      bankSupplyContractName: to,
      dateOfLastAction: now(),
    },
  };

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id: deal._id }, // eslint-disable-line no-underscore-dangle
    $.flatten(update),
    { returnOriginal: false },
  );

  const { value } = findAndUpdateResponse;
  return value;
};

exports.update = (req, res) => {
  const { user } = req;
  const { bankSupplyContractName } = req.body;

  findOneDeal(req.params.id, async (deal) => {
    if (!deal) return res.status(404).send();
    if (!userOwns(user, deal)) return res.status(401).send();

    const validationErrors = validateNameChange(deal, bankSupplyContractName);

    if (validationErrors) {
      return res.status(200).send({
        success: false,
        ...validationErrors,
      });
    }

    const collection = await db.getCollection('deals');
    const dealAfterAllUpdates = await updateName(collection, deal, bankSupplyContractName);
    return res.status(200).send(dealAfterAllUpdates.details.bankSupplyContractName);
  });
};
