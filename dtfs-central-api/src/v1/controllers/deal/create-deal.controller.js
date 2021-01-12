const db = require('../../../drivers/db-client');
const DEFAULTS = require('../../defaults');
const now = require('../../../now');
const getDealErrors = require('../../validation/create-deal');
const { generateDealId } = require('../../../utils/generate-ids');

const createDeal = async (req) => {
  const collection = await db.getCollection('deals');
  const dealId = await generateDealId();
  const time = now();

  const makerBank = req.body.details && req.body.details.maker && req.body.details.maker.bank;

  const newDeal = {
    _id: dealId,
    ...DEFAULTS.DEALS,
    ...req.body,
    details: {
      ...DEFAULTS.DEALS.details,
      ...req.body.details,
      created: time,
      dateOfLastAction: time,
      owningBank: makerBank,
    },
    eligibility: {
      ...DEFAULTS.DEALS.eligibility,
      ...req.body.eligibility,
    },
    facilities: DEFAULTS.DEALS.facilities,
  };

  const validationErrors = getDealErrors(newDeal);

  if (validationErrors.count !== 0) {
    return { validationErrors };
  }

  const response = await collection.insertOne(newDeal);

  const createdDeal = response.ops[0];

  return {
    deal: createdDeal,
  };
};

exports.createDealPost = async (req, res) => {
  const {
    validationErrors,
    deal,
  } = await createDeal(req);

  if (validationErrors) {
    return res.status(400).send({
      validationErrors,
    });
  }

  return res.status(200).send(deal);
};
