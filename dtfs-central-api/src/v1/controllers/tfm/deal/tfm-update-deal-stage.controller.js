const $ = require('mongo-dot-notation');
const db = require('../../../../drivers/db-client');
const { findOneDeal } = require('./tfm-get-deal.controller');

const withoutId = (obj) => {
  const { _id, ...cleanedObject } = obj;
  return cleanedObject;
};

const updateDeal = async (dealId, deal, stage) => {
  const collection = await db.getCollection('tfm-deals');

  const update = {
    tfm: {
      ...deal.tfm,
      stage,
    },
  };

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id: dealId },
    $.flatten(withoutId(update)),
    { returnDocument: 'after', returnOriginal: false },
  );

  return findAndUpdateResponse.value;
};

exports.updateDealStagePut = async (req, res) => {
  const dealId = req.params.id;

  const { stage } = req.body;

  const deal = await findOneDeal(dealId, false, 'tfm');

  if (deal) {
    const updatedDeal = await updateDeal(
      dealId,
      deal,
      stage,
    );
    return res.status(200).json(updatedDeal);
  }

  return res.status(404).send();
};
