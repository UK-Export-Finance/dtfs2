const db = require('../../../../drivers/db-client');
const { findOneDeal } = require('../../portal/deal/get-deal.controller');

const createSubmittedDeal = async (dealId) => {
  const portalDeal = await findOneDeal(dealId);
  const tfmDealCollection = await db.getCollection('deals-tfm');
  const response = await tfmDealCollection.insertOne(portalDeal);

  const createdDeal = response.ops[0];

  return {
    deal: createdDeal,
  };
};
exports.createSubmittedDeal = createSubmittedDeal;
