const { ObjectId } = require('mongodb');
const { findOneDeal } = require('./get-gef-deal.controller');
const db = require('../../../../drivers/db-client');
const { DB_COLLECTIONS } = require('../../../../constants');

const updateDealStatus = async (dealId, previousStatus, newStatus) => {
  if (ObjectId.isValid(dealId)) {
    const collection = await db.getCollection(DB_COLLECTIONS.DEALS);

    const dealUpdate = {
      previousStatus,
      status: newStatus,
      updatedAt: Date.now(),
    };

    const findAndUpdateResponse = await collection.findOneAndUpdate(
      { _id: { $eq: ObjectId(String(dealId)) } },
      { $set: dealUpdate },
      { returnNewDocument: true, returnDocument: 'after' },
    );

    console.info('Updated Portal GEF deal status from %O to %O', previousStatus, newStatus);

    return findAndUpdateResponse.value;
  }
  return { status: 400, message: 'Invalid Deal Id' };
};
exports.updateDealStatus = updateDealStatus;

// eslint-disable-next-line consistent-return
exports.updateDealStatusPut = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    const dealId = req.params.id;

    const { status: newStatus } = req.body;

    await findOneDeal(dealId, async (existingDeal) => {
      if (existingDeal) {
        if (existingDeal.status === newStatus) {
          return res.status(400).send();
        }

        const updatedDeal = await updateDealStatus(dealId, existingDeal.status, newStatus);
        return res.status(200).json(updatedDeal);
      }

      return res.status(404).send({ status: 404, message: 'Deal not found' });
    });
  } else {
    return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
  }
};
