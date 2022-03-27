const { ObjectId } = require('mongodb');
const $ = require('mongo-dot-notation');
const { findOneDeal } = require('./get-deal.controller');
const db = require('../../../../drivers/db-client');

const withoutId = (obj) => {
  const cleanedObject = { ...obj };
  delete cleanedObject._id;
  return cleanedObject;
};

const updateDealStatus = async (dealId, status, existingDeal) => {
  if (ObjectId.isValid(dealId)) {
    const dealsCollection = await db.getCollection('deals');

    const previousStatus = existingDeal.status;

    const modifiedDeal = {
      ...existingDeal,
      updatedAt: Date.now(),
      status,
      previousStatus,
    };

    const findAndUpdateResponse = await dealsCollection.findOneAndUpdate(
      { _id: ObjectId(dealId) },
      $.flatten(withoutId(modifiedDeal)),
      { returnOriginal: false },
    );

    console.info(`Updated Portal BSS deal status from ${previousStatus} to ${status}`);

    return findAndUpdateResponse.value;
  }
  return { status: 400, message: 'Invalid Deal Id' };
};
exports.updateDealStatus = updateDealStatus;

exports.updateDealStatusPut = async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
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
      return res.status(404).send({ status: 404, message: 'Deal not found' });
    });
  } else {
    return res.status(400).send({ status: 400, message: 'Invalid Deal Id' });
  }
};
