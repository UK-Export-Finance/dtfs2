import { MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { mongoDbClient as db } from '../../../drivers/db-client';

export const findOneBank = async (id) => {
  if (typeof id !== 'string') {
    return { status: 400, message: 'Invalid Bank Id' };
  }

  const banksCollection = await db.getCollection(MONGO_DB_COLLECTIONS.BANKS);

  const bank = await banksCollection.findOne({ id: { $eq: id } });

  return bank;
};

export const findOneBankGet = async (req, res) => {
  const bank = await findOneBank(req.params.bankId);

  if (bank) {
    return res.status(200).send(bank);
  }

  return res.status(404).send();
};
