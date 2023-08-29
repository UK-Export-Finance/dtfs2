const { ObjectId } = require('mongodb');
const { findOneDeal } = require('./get-gef-deal.controller');
const db = require('../../../../drivers/db-client');

const updateDeal = async (dealId, update) => {
  try {
    if (!ObjectId.isValid(dealId)) {
      return { status: 400, message: 'Invalid Deal Id' };
    }

    const collection = await db.getCollection('deals');
    const originalDeal = await findOneDeal(dealId);
    const dealUpdate = {
      ...originalDeal,
      ...update,
      updatedAt: Date.now(),
    };
    const findAndUpdateResponse = await collection.findOneAndUpdate(
      { _id: { $eq: ObjectId(String(dealId)) } },
      { $set: dealUpdate },
      { returnNewDocument: true, returnDocument: 'after' }
    );

    return findAndUpdateResponse.value;
  } catch (error) {
    console.error('Unable to update deal %s', dealId);
    return { status: 400, message: error };
  }
};
exports.updateDeal = updateDeal;

exports.updateDealPut = async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
    }

    const dealId = req.params.id;
    const { dealUpdate } = req.body;

    return findOneDeal(dealId, async (existingDeal) => {
      if (existingDeal) {
        const updatedDeal = await updateDeal(dealId, dealUpdate);
        return res.status(200).json(updatedDeal);
      }

      return res.status(404).send();
    });
  } catch (error) {
    console.error('Unable to update deal');
    return res.status(400).send({ status: 400, message: error });
  }
};
