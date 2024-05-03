import { MONGO_DB_COLLECTIONS, Bank } from '@ukef/dtfs2-common';
import db from '../drivers/db-client';

export const getAllBanks = async (): Promise<Bank[]> => {
  const banksCollection = await db.getCollection(MONGO_DB_COLLECTIONS.BANKS);
  return await banksCollection.find().toArray();
};

export const getBankNameById = async (bankId: string) => {
  const banksCollection = await db.getCollection(MONGO_DB_COLLECTIONS.BANKS);
  const bank = await banksCollection.findOne({ id: { $eq: bankId } });
  return bank?.name;
};
