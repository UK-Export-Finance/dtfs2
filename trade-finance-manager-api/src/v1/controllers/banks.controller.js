const db = require('../../drivers/db-client');

const findOneBank = async (id) => {
  if (typeof id !== 'string') {
    throw new Error('Invalid Bank Id');
  }

  const collection = await db.getCollection('banks');

  const bank = await collection.findOne({ id: { $eq: id } });
  return bank;
};
exports.findOneBank = findOneBank;
