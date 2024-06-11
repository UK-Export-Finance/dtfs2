import { MONGO_DB_COLLECTIONS, Bank } from '@ukef/dtfs2-common';
import { mongoDbClient as db } from '../drivers/db-client';

export const getAllBanks = async (): Promise<Bank[]> => {
  const banksCollection = await db.getCollection(MONGO_DB_COLLECTIONS.BANKS);
  return await banksCollection.find().toArray();
};

export const getBankNameById = async (bankId: string) => {
  const banksCollection = await db.getCollection(MONGO_DB_COLLECTIONS.BANKS);
  const bank = await banksCollection.findOne({ id: { $eq: bankId } });
  return bank?.name;
};

export const getBankById = async (bankId: string): Promise<Bank | null> => {
  const banksCollection = await db.getCollection(MONGO_DB_COLLECTIONS.BANKS);
  return await banksCollection.findOne({ id: { $eq: bankId } });
};
