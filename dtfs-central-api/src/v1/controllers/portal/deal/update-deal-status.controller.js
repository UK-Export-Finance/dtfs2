const $ = require('mongo-dot-notation');
const { findOneDeal } = require('./get-deal.controller');
const db = require('../../../../drivers/db-client');
const now = require('../../../../now');

const withoutId = (obj) => {
  const cleanedObject = { ...obj };
  delete cleanedObject._id; // eslint-disable-line no-underscore-dangle
  return cleanedObject;
};

const updateDealStatus = async (dealId, status, existingDeal) => {
  const collection = await db.getCollection('deals');

  console.log(`Updating Portal BSS deal status to ${status}`);
  const previousStatus = existingDeal.details.status;

  const modifiedDeal = {
    ...existingDeal,
    details: {
      ...existingDeal.details,
      status,
      previousStatus,
      dateOfLastAction: now(),
    },
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
