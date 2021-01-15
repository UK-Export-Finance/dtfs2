const db = require('../../../drivers/db-client');
const DEFAULTS = require('../../defaults');
const now = require('../../../now');
const getDealErrors = require('../../validation/create-deal');
const { generateDealId } = require('../../../utils/generate-ids');

const createDeal = async (deal, maker) => {
  const collection = await db.getCollection('deals');
  const dealId = await generateDealId();
  const time = now();

  const { details } = deal;

  const newDeal = {
    _id: dealId,
    ...DEFAULTS.DEALS,
    ...deal,
    details: {
      ...DEFAULTS.DEALS.details,
      ...details,
      created: time,
      dateOfLastAction: time,
      maker,
      owningBank: maker && maker.bank,
    },
    facilities: DEFAULTS.DEALS.facilities,
  };

  const validationErrors = getDealErrors(newDeal);

  if (validationErrors.count !== 0) {
    return {
      deal: newDeal,
      validationErrors,
    };
  }

  const response = await collection.insertOne(newDeal);

  const createdDeal = response.ops[0];

  return {
    deal: createdDeal,
  };
};

exports.createDealPost = async (req, res) => {
  const { user } = req.body;
  if (!user) {
    return res.status(404).send();
  }

  const {
    validationErrors,
    deal,
  } = await createDeal(req.body.deal, user);

  if (validationErrors) {
    return res.status(400).send({
      ...deal,
      validationErrors,
    });
  }

  return res.status(200).send(deal);
};
