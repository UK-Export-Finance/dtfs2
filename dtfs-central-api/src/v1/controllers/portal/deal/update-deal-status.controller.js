const { ObjectId } = require('mongodb');
const $ = require('mongo-dot-notation');
const { findOneGefDeal, findOneBssDeal } = require('./get-deal.controller');
const db = require('../../../../database/mongo-client');

const withoutId = (obj) => {
  const cleanedObject = { ...obj };
  delete cleanedObject._id;
  return cleanedObject;
};

const updateBssDealStatus = async (dealId, status, existingDeal) => {
  if (ObjectId.isValid(dealId)) {
    const dealsCollection = await db.getCollection('deals');

    const previousStatus = existingDeal.status;

    const modifiedDeal = {
      updatedAt: Date.now(),
      status,
      previousStatus,
    };

    const findAndUpdateResponse = await dealsCollection.findOneAndUpdate(
      { _id: ObjectId(dealId) },
      $.flatten(withoutId(modifiedDeal)),
      { returnDocument: 'after', returnNewDocument: true }
    );

    console.info(`Updated Portal BSS deal ${dealId} status from ${previousStatus} to ${status}`);

    return findAndUpdateResponse.value;
  }
  return { status: 400, message: 'Invalid Deal Id' };
};
exports.updateBssDealStatus = updateBssDealStatus;

exports.putBssDealStatus = async (req, res) => {
  const dealId = req.params.id;

  const { status } = req.body;

  await findOneBssDeal(dealId, async (existingDeal) => {
    if (existingDeal) {
      if (existingDeal.status === status) {
        return res.status(200).send();
      }
      const updatedDeal = await updateBssDealStatus(dealId, status, existingDeal);
      return res.status(200).json(updatedDeal);
    }
    return res.status(404).send({ status: 404, message: 'Deal not found' });
  });
};

// GEF section

const updateGefDealStatus = async (dealId, previousStatus, newStatus) => {
  if (ObjectId.isValid(dealId)) {
    const collection = await db.getCollection('deals');

    const dealUpdate = {
      previousStatus,
      status: newStatus,
      updatedAt: Date.now(),
    };

    const findAndUpdateResponse = await collection.findOneAndUpdate(
      { _id: { $eq: ObjectId(String(dealId)) } },
      { $set: dealUpdate },
      { returnDocument: 'after', returnNewDocument: true },
    );

    console.info(`Updated Portal GEF deal status from ${previousStatus} to ${newStatus}`);

    return findAndUpdateResponse.value;
  }
  return { status: 400, message: 'Invalid Deal Id' };
};
exports.updateGefDealStatus = updateGefDealStatus;

exports.putGefDealStatus = async (req, res) => {
  const dealId = req.params.id;

  const { status: newStatus } = req.body;

  await findOneGefDeal(dealId, async (existingDeal) => {
    if (existingDeal) {
      if (existingDeal.status === newStatus) {
        return res.status(400).send();
      }

      const updatedDeal = await updateGefDealStatus(dealId, existingDeal.status, newStatus);
      return res.status(200).json(updatedDeal);
    }

    return res.status(404).send({ status: 404, message: 'Deal not found' });
  });
};
