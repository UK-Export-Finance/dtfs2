const db = require('../../../drivers/db-client').default;
const { PAYLOAD, DB_COLLECTIONS } = require('../../../constants');
const { payloadVerification } = require('../../../helpers');

const createBank = async (bank) => {
  const collection = await db.getCollection(DB_COLLECTIONS.BANKS);

  const response = await collection.insertOne(bank);

  const { insertedId } = response;

  return {
    _id: insertedId,
  };
};

exports.createBankPost = async (req, res) => {
  const payload = req.body;

  if (payloadVerification(req.body, PAYLOAD.BANK)) {
    const bank = await createBank(payload);
    return res.status(200).send(bank);
  }

  return res.status(400).send({ status: 400, message: 'Invalid bank payload' });
};
