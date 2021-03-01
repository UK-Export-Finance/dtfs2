const $ = require('mongo-dot-notation');
const db = require('../../../../drivers/db-client');
const { findOneDeal } = require('./tfm-get-deal.controller');

const withoutId = (obj) => {
  const { _id, ...cleanedObject } = obj;
  return cleanedObject;
};

const updateDeal = async (dealId, dealChanges) => {
  const collection = await db.getCollection('tfm-deals');

  // Remove dealSnapshot to ensure its not updated
  const { dealSnapshot, ...update } = dealChanges;

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id: dealId },
    $.flatten(withoutId(update)),
    { returnOriginal: false },
  );

  return findAndUpdateResponse.value;
};

exports.updateDealPut = async (req, res) => {
  const dealId = req.params.id;

  const { user, dealUpdate } = req.body;
  const deal = await findOneDeal(dealId, false, 'tfm');
  if (deal) {
    const updatedDeal = await updateDeal(
      dealId,
      dealUpdate,
      user,
      deal,
      req.routePath,
    );
    return res.status(200).json(updatedDeal);
  }
  return res.status(404).send();
};
