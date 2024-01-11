import db from '../../drivers/db-client';
import { DB_COLLECTIONS } from '../../constants';
import { Bank, ReportPeriodSchedule } from '../../types/db-models/banks';

export const getAllBanks = async (): Promise<Bank[]> => {
  const banksCollection = await db.getCollection(DB_COLLECTIONS.BANKS);
  return await banksCollection.find().toArray();
};

export const getBankNameById = async (bankId: string) => {
  const banksCollection = await db.getCollection(DB_COLLECTIONS.BANKS);
  const bank = await banksCollection.findOne({ id: bankId });
  return bank?.name;
};

export const getBankReportScheduleByBankId = async (bankId: string): Promise<ReportPeriodSchedule[]> => {
  const banksCollection = await db.getCollection(DB_COLLECTIONS.BANKS);
  const bank = await banksCollection.findOne({ id: bankId });
  if (!bank) {
    throw new Error(`Failed to find a bank with id ${bankId}`);
  }
  return bank.utilisationReportPeriodSchedule;
};
