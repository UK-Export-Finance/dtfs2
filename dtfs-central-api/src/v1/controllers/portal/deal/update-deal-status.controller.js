const $ = require('mongo-dot-notation');
const { findOneDeal } = require('./get-deal.controller');
const db = require('../../../../drivers/db-client');
const now = require('../../../../now');

const withoutId = (obj) => {
  const cleanedObject = { ...obj };
  delete cleanedObject._id; // eslint-disable-line no-underscore-dangle
  return cleanedObject;
};

const updateDeal = async (dealId, status, existingDeal) => {
  const collection = await db.getCollection('deals');

  const modifiedDeal = {
    ...existingDeal,
    details: {
      ...existingDeal.details,
      status,
      previousStatus: existingDeal.details.status,
      dateOfLastAction: now(),
    },
  };

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id: dealId },
    $.flatten(withoutId(modifiedDeal)),
    { returnOriginal: false },
  );

  return findAndUpdateResponse.value;
};
exports.updateDeal = updateDeal;

exports.updateDealStatusPut = async (req, res) => {
  const dealId = req.params.id;

  const { status } = req.body;

  await findOneDeal(dealId, async (existingDeal) => {
    if (existingDeal) {
      const updatedDeal = await updateDeal(
        dealId,
        status,
        existingDeal,
      );
      return res.status(200).json(updatedDeal);
    }
    return res.status(404).send();
  });
};
