const db = require('../../../drivers/db-client');

const createBank = async (bank) => {
  const collection = await db.getCollection('banks');

  const response = await collection.insertOne(bank);

  const createdBank = response.ops[0];

  return createdBank;
};

exports.createBankPost = async (req, res) => {
  const bank = await createBank(req.body);

  return res.status(200).send(bank);
};
