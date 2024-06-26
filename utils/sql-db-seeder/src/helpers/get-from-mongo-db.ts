import { Bank, PortalUser, TfmUser, ROLES, TEAM_IDS } from '@ukef/dtfs2-common';
import { mongoDbClient } from '../mongo-db-client';

const getPaymentReportOfficerOrFail = async (username: string): Promise<PortalUser> => {
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

const getPdcReconcileTfmUserOrFail = async (username: string): Promise<TfmUser> => {
  const tfmUsersCollection = await mongoDbClient.getCollection('tfm-users');
  const pdcReconcileUser: TfmUser | null = await tfmUsersCollection.findOne({
    username: { $eq: username },
    teams: { $in: [TEAM_IDS.PDC_RECONCILE] },
  });
  if (!pdcReconcileUser) {
    throw new Error(`Failed to get a TFM user in team ${TEAM_IDS.PDC_RECONCILE}`);
  }
  return pdcReconcileUser;
};

export const getUsersFromMongoDbOrFail = async ({
  paymentReportOfficerUsername,
  pdcReconcileUserUsername,
}: {
  paymentReportOfficerUsername: string;
  pdcReconcileUserUsername: string;
}): Promise<{
  paymentReportOfficer: PortalUser;
  pdcReconcileUser: TfmUser;
}> => {
  const paymentReportOfficer = await getPaymentReportOfficerOrFail(paymentReportOfficerUsername);
  const pdcReconcileUser = await getPdcReconcileTfmUserOrFail(pdcReconcileUserUsername);

  return {
    paymentReportOfficer,
    pdcReconcileUser,
  };
};

export const getAllBanksFromMongoDb = async (): Promise<Bank[]> => {
  const banksCollection = await mongoDbClient.getCollection('banks');
  return banksCollection.find({}).toArray();
};
