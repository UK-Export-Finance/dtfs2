const db = require('../../drivers/db-client');

const findOneDeal = async (_id) => {
  const collection = await db.getCollection('deals');
  return collection.findOne({ _id });
};
exports.findOneDeal = findOneDeal;
