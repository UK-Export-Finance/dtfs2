import z from 'zod';
import { MongoDbClient } from '@ukef/dtfs2-common/mongo-db-client';
import { Bank, PortalUser, TfmUser, ROLES, TEAM_IDS } from '@ukef/dtfs2-common';

const mongoDbConfigSchema = z.object({
  MONGODB_URI: z.string(),
  MONGO_INITDB_DATABASE: z.string(),
});

const getMongoDbClient = (): MongoDbClient => {
  const mongoDbConfig = mongoDbConfigSchema.parse(process.env);
  return new MongoDbClient({
    dbName: mongoDbConfig.MONGO_INITDB_DATABASE,
    dbConnectionString: mongoDbConfig.MONGODB_URI,
  });
};

const getPaymentReportOfficerOrFail = async (mongoDbClient: MongoDbClient): Promise<PortalUser> => {
  const usersCollection = await mongoDbClient.getCollection('users');
  const paymentReportOfficer: PortalUser | null = await usersCollection.findOne({
    roles: { $in: [ROLES.PAYMENT_REPORT_OFFICER] },
  });
  if (!paymentReportOfficer) {
    throw new Error(`Failed to get a portal user with role ${ROLES.PAYMENT_REPORT_OFFICER}`);
  }
  return paymentReportOfficer;
};

const getPdcReconcileTfmUserOrFail = async (mongoDbClient: MongoDbClient): Promise<TfmUser> => {
  const tfmUsersCollection = await mongoDbClient.getCollection('tfm-users');
  const pdcReconcileUser: TfmUser | null = await tfmUsersCollection.findOne({
    teams: { $in: [TEAM_IDS.PDC_RECONCILE] },
  });
  if (!pdcReconcileUser) {
    throw new Error(`Failed to get a TFM user in team ${TEAM_IDS.PDC_RECONCILE}`);
  }
  return pdcReconcileUser;
};

export const getUsersFromMongoDb = async (): Promise<{
  paymentReportOfficer: PortalUser;
  pdcReconcileUser: TfmUser;
}> => {
  const mongoDbClient = getMongoDbClient();

  const paymentReportOfficer = await getPaymentReportOfficerOrFail(mongoDbClient);
  const pdcReconcileUser = await getPdcReconcileTfmUserOrFail(mongoDbClient);

  return {
    paymentReportOfficer,
    pdcReconcileUser,
  };
};

export const getAllBanksFromMongoDb = async (): Promise<Bank[]> => {
  const mongoDbClient = getMongoDbClient();

  const banksCollection = await mongoDbClient.getCollection('banks');
  return banksCollection.find({}).toArray();
};
