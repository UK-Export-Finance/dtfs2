const db = require('../../../database/mongo-client');

const findOneBank = async (id) => {
  const banksCollection = await db.getCollection('banks');

  const bank = await banksCollection.findOne({ id });

  return bank;
};
exports.findOneBank = findOneBank;

exports.findOneBankGet = async (req, res) => {
  const bank = await findOneBank(req.params.id);

  if (bank) {
    return res.status(200).send(bank);
  }

  return res.status(404).send();
};
