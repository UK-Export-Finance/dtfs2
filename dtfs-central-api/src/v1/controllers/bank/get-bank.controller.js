const db = require('../../../drivers/db-client');

const findOneBank = async (id) => {
  if (typeof id !== 'string') {
    return { status: 400, message: 'Invalid Bank Id' };
  }

  const banksCollection = await db.getCollection('banks');

  const bank = await banksCollection.findOne({ id: { $eq: id } });

  return bank;
};
exports.findOneBank = findOneBank;

exports.findOneBankGet = async (req, res) => {
  const bank = await findOneBank(req.params.bankId);

  if (bank) {
    return res.status(200).send(bank);
  }

  return res.status(404).send();
};
