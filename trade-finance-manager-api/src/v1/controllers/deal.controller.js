const db = require('../../drivers/db-client');
const mapDeal = require('../mappings/map-deal');

const findOneDeal = async (_id) => {
  const collection = await db.getCollection('deals');
  const deal = await collection.findOne({ _id });

  return mapDeal(deal);
};
exports.findOneDeal = findOneDeal;
