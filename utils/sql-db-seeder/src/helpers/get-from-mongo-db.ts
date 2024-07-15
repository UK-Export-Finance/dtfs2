import { Bank, PortalUser, ROLES } from '@ukef/dtfs2-common';
import { mongoDbClient } from '../mongo-db-client';

export const getPaymentReportOfficerOrFail = async (username: string): Promise<PortalUser> => {
  const usersCollection = await mongoDbClient.getCollection('users');
  const paymentReportOfficer: PortalUser | null = await usersCollection.findOne({
    username: { $eq: username },
    roles: { $in: [ROLES.PAYMENT_REPORT_OFFICER] },
  });
  if (!paymentReportOfficer) {
    throw new Error(`Failed to get a portal user with role ${ROLES.PAYMENT_REPORT_OFFICER}`);
  }
  return paymentReportOfficer;
};

export const getAllBanksFromMongoDb = async (): Promise<Bank[]> => {
  const banksCollection = await mongoDbClient.getCollection('banks');
  return banksCollection.find({}).toArray();
};
