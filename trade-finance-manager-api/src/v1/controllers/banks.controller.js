const db = require('../../drivers/db-client');

const findOneBank = async (id) => {
  const collection = await db.getCollection('banks');

  const bank = await collection.findOne({ id });
  return bank;
};
exports.findOneBank = findOneBank;
