const { ObjectId } = require('mongodb');
const { findOneDeal } = require('./get-gef-deal.controller');
const db = require('../../../../drivers/db-client');
const { isNumber } = require('../../../../helpers');
const { DB_COLLECTIONS } = require('../../../../constants');

const updateDeal = async (dealId, update) => {
  try {
    if (!ObjectId.isValid(dealId)) {
      return { status: 400, message: 'Invalid Deal Id' };
    }

    const collection = await db.getCollection(DB_COLLECTIONS.DEALS);
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
    console.error('Unable to update deal %O %O', dealId, error);
    return { status: 500, message: error };
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

    return await findOneDeal(dealId, async (existingDeal) => {
      if (existingDeal) {
        const response = await updateDeal(dealId, dealUpdate);
        const status = isNumber(response?.status, 3);
        const code = status ? response.status : 200;

        return res.status(code).json(response);
      }

      return res.status(404).send();
    });
  } catch (error) {
    console.error('Unable to update deal %O', error);
    return res.status(500).send({ status: 500, message: error });
  }
};
