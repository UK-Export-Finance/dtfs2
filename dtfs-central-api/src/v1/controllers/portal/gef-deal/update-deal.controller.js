const { ObjectID } = require('mongodb');
const { findOneDeal } = require('./get-gef-deal.controller');
const db = require('../../../../drivers/db-client');

const updateDeal = async (dealId, update) => {
  const collection = await db.getCollection('deals');
  const originalDeal = await findOneDeal(dealId);

  console.log('Updating Portal GEF deal.');

  const dealUpdate = {
    ...originalDeal,
    ...update,
    updatedAt: Date.now(),
  };

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id: { $eq: ObjectID(String(dealId)) } },
    {
      $set: dealUpdate,
    },
    { returnOriginal: false },
  );

  console.log('Updated Portal GEF deal');

  return findAndUpdateResponse.value;
};
exports.updateDeal = updateDeal;

exports.updateDealPut = async (req, res) => {
  const dealId = req.params.id;

  const { dealUpdate } = req.body;

  await findOneDeal(dealId, async (existingDeal) => {
    if (existingDeal) {
      const updatedDeal = await updateDeal(
        dealId,
        dealUpdate,
      );
      return res.status(200).json(updatedDeal);
    }

    return res.status(404).send();
  });
};
