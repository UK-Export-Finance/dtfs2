const db = require('../../../database/mongo-client');

const createBank = async (bank) => {
  const collection = await db.getCollection('banks');

  const response = await collection.insertOne(bank);

  const { insertedId } = response;

  return {
    _id: insertedId,
  };
};

exports.createBankPost = async (req, res) => {
  const bank = await createBank(req.body);

  return res.status(200).send(bank);
};
