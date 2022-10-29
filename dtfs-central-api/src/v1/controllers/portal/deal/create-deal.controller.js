const db = require('../../../../database/mongo-client');
const DEFAULTS = require('../../../defaults');
const getDealErrors = require('../../../validation/create-deal');

const createBssDeal = async (deal, maker) => {
  const collection = await db.getCollection('deals');

  const { details } = deal;

  const newDeal = {
    ...DEFAULTS.DEAL,
    ...deal,
    updatedAt: Date.now(),
    maker,
    bank: maker && maker.bank,
    details: {
      ...DEFAULTS.DEAL.details,
      ...details,
      created: Date.now(),
    },
    facilities: DEFAULTS.DEAL.facilities,
  };

  const validationErrors = getDealErrors(newDeal);

  if (validationErrors.count !== 0) {
    return {
      deal: newDeal,
      validationErrors,
    };
  }

  const response = await collection.insertOne(newDeal);

  const { insertedId } = response;

  return { _id: insertedId, };
};

exports.postBssDeal = async (req, res) => {
  const { user } = req.body;
  if (!user) {
    return res.status(404).send();
  }

  const { validationErrors, _id } = await createBssDeal(req.body.deal, user);

  if (validationErrors) {
    return res.status(400).send({ _id, validationErrors });
  }

  return res.status(200).send({ _id });
};

exports.postGefDeal = async (req, res) => {
  const collection = await db.getCollection('deals');
  const response = await collection.insertOne(req.body);

  return res.status(200).send({ _id: response.insertedId });
};
