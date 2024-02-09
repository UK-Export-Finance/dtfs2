import z from 'zod';
import { MongoDbClient } from '../../mongo-db-client';
import { PortalUser, TfmUser } from '../../types/mongo-db-models';
import { ROLES } from '../../constants/portal/roles';
import { TEAM_IDS } from '../../constants/tfm/team-ids';

const mongoDbConfigSchema = z.object({
  MONGODB_URI: z.string(),
  MONGO_INITDB_DATABASE: z.string(),
});

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
  const mongoDbConfig = mongoDbConfigSchema.parse(process.env);
  const mongoDbClient = new MongoDbClient({
    dbName: mongoDbConfig.MONGO_INITDB_DATABASE,
    dbConnectionString: mongoDbConfig.MONGODB_URI,
  });

  const paymentReportOfficer = await getPaymentReportOfficerOrFail(mongoDbClient);
  const pdcReconcileUser = await getPdcReconcileTfmUserOrFail(mongoDbClient);

  return {
    paymentReportOfficer,
    pdcReconcileUser,
  };
};
