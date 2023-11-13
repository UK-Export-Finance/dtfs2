const db = require('../../../drivers/db-client');

exports.getAllBanksGet = async (req, res) => {
  const banksCollection = await db.getCollection('banks');
  const banks = await banksCollection.find().toArray();
  res.status(200).send(banks);
};
