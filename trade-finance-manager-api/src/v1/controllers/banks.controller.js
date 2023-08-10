const db = require('../../drivers/db-client');

const findOneBank = async (id) => {
  const collection = await db.getCollection('banks');

  const bank = await collection.findOne({ id: { $eq: id } }); // TODO SR-8: Check the type of bank id with Abhi and add validation.
  return bank;
};
exports.findOneBank = findOneBank;
