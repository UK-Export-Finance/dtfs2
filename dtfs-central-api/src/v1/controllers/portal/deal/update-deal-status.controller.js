const $ = require('mongo-dot-notation');
const { findOneDeal } = require('./get-deal.controller');
const db = require('../../../../drivers/db-client');

const withoutId = (obj) => {
  const cleanedObject = { ...obj };
  delete cleanedObject._id;
  return cleanedObject;
};

const updateDealStatus = async (dealId, status, existingDeal) => {
  const collection = await db.getCollection('deals');

  const previousStatus = existingDeal.status;

  const modifiedDeal = {
    ...existingDeal,
    updatedAt: Date.now(),
    status,
    previousStatus,
  };

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id: dealId },
    $.flatten(withoutId(modifiedDeal)),
    { returnOriginal: false },
  );

  console.log(`Updated Portal BSS deal status from ${previousStatus} to ${status}`);

  return findAndUpdateResponse.value;
};
exports.updateDealStatus = updateDealStatus;

exports.updateDealStatusPut = async (req, res) => {
  const dealId = req.params.id;

  const { status } = req.body;

  await findOneDeal(dealId, async (existingDeal) => {
    if (existingDeal) {
      if (existingDeal.status === status) {
        return res.status(400).send();
      }
      const updatedDeal = await updateDealStatus(
        dealId,
        status,
        existingDeal,
      );
      return res.status(200).json(updatedDeal);
    }
    return res.status(404).send();
  });
};
