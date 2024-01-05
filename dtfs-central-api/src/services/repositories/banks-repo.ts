import db from '../../drivers/db-client';
import { DB_COLLECTIONS } from '../../constants';

export const getAllBanks = async () => {
  const banksCollection = await db.getCollection(DB_COLLECTIONS.BANKS);
  return await banksCollection.find().toArray();
};

export const getBankNameById = async (bankId: string) => {
  const banksCollection = await db.getCollection(DB_COLLECTIONS.BANKS);
  const bank = await banksCollection.findOne({ id: bankId });
  return bank?.name;
};
