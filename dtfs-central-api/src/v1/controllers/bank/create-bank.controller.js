import { MONGO_DB_COLLECTIONS, PAYLOAD_VERIFICATION } from '@ukef/dtfs2-common';
import { isVerifiedPayload } from '@ukef/dtfs2-common/payload-verification';

import { mongoDbClient as db } from '../../../drivers/db-client';

const createBank = async (bank) => {
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.BANKS);

  const response = await collection.insertOne(bank);

  const { insertedId } = response;

  return {
    _id: insertedId,
  };
};

export const createBankPost = async (req, res) => {
  const payload = req.body;

  if (!isVerifiedPayload({ payload, template: PAYLOAD_VERIFICATION.BANK })) {
    return res.status(400).send({ status: 400, message: 'Invalid bank payload' });
  }

  const bank = await createBank(payload);
  return res.status(200).send(bank);
};
