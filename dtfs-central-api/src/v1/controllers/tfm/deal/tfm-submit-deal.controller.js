const $ = require('mongo-dot-notation');
const db = require('../../../../drivers/db-client');
const { findOneDeal } = require('../../portal/deal/get-deal.controller');

const withoutId = (obj) => {
  const { _id, ...cleanedObject } = obj;
  return cleanedObject;
};

const submitDeal = async (deal) => {
  const collection = await db.getCollection('tfm-deals');

  const update = {
    dealSnapshot: deal,
  };

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    // eslint-disable-next-line no-underscore-dangle
    { _id: deal._id },
    $.flatten(withoutId(update)),
    { returnOriginal: false },
  );

  return findAndUpdateResponse.value;
};

exports.submitDealPut = async (req, res) => {
  const { dealId } = req.body;

  await findOneDeal(dealId, async (deal) => {
    if (deal) {
      const updatedDeal = await submitDeal(deal);
      return res.status(200).json(updatedDeal);
    }
    return res.status(404).send();
  });
};
