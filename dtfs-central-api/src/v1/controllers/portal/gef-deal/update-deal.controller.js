const { ObjectId } = require('mongodb');
const { findOneDeal } = require('./get-gef-deal.controller');
const db = require('../../../../drivers/db-client');

const updateDeal = async (dealId, update) => {
  if (ObjectId.isValid(dealId)) {
    const collection = await db.getCollection('deals');
    const originalDeal = await findOneDeal(dealId);

    console.info('Updating Portal GEF deal.');

    const dealUpdate = {
      ...originalDeal,
      ...update,
      updatedAt: Date.now(),
    };

    const findAndUpdateResponse = await collection.findOneAndUpdate( // TODO SR-8
      { _id: { $eq: ObjectId(String(dealId)) } },
      { $set: dealUpdate },
      { returnNewDocument: true, returnDocument: 'after' }
    );

    console.info('Updated Portal GEF deal');

    return findAndUpdateResponse.value;
  }
  return { status: 400, message: 'Invalid Deal Id' };
};
exports.updateDeal = updateDeal;

// eslint-disable-next-line consistent-return
exports.updateDealPut = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    const dealId = req.params.id;

    const { dealUpdate } = req.body;

    await findOneDeal(dealId, async (existingDeal) => {
      if (existingDeal) {
        const updatedDeal = await updateDeal(dealId, dealUpdate);
        return res.status(200).json(updatedDeal);
      }

      return res.status(404).send();
    });
  } else {
    return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
  }
};
