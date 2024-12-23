import { Bank, MONGO_DB_COLLECTIONS, PDC_TEAM_IDS, PortalUser, ROLES, TfmUser } from '@ukef/dtfs2-common';
import { mongoDbClient } from '../../../drivers/db-client';

/**
 * This class should be used to query values from the MongoDB database. It is
 * used to that values can be cached, making repeat calls to the same query
 * more efficient
 */
export class MongoDbDataLoader {
  private static allBanks: Bank[] | undefined;

  private static banks: Record<string, Bank> = {};

  private static pdcReconciledUser: TfmUser | undefined;

  private static paymentReportOfficerUsers: Record<string, PortalUser> = {};

  /**
   * Gets all banks
   * @returns All banks
   */
  public static async getAllBanks(): Promise<Bank[]> {
    if (this.allBanks) {
      return this.allBanks;
    }
    const collection = await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.BANKS);
    this.allBanks = await collection.find().toArray();
    this.allBanks.forEach((bank) => {
      this.banks[bank.id] = bank;
    });
    return this.allBanks;
  }

  /**
   * Gets a PDC_RECONCILE user
   * @returns A PDC_RECONCILE user
   * @throws {Error} If a user in the PDC_RECONCILE team cannot be found
   */
  public static async getPdcReconcileUserOrFail(): Promise<TfmUser> {
    if (this.pdcReconciledUser) {
      return this.pdcReconciledUser;
    }
    const collection = await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.TFM_USERS);
    const user = await collection.findOne({ teams: { $in: [PDC_TEAM_IDS.PDC_RECONCILE] } });
    if (!user) {
      throw new Error(`Failed to find a tfm user with role '${PDC_TEAM_IDS.PDC_RECONCILE}'`);
    }
    this.pdcReconciledUser = user;
    return user;
  }

  /**
   * Gets a payment report officer user with the supplied username
   * @param username - The user username
   * @returns The found user
   * @throws {Error} If the user cannot be found
   */
  public static async getPaymentReportOfficerWithUsernameOrFail(username: string): Promise<PortalUser> {
    if (this.paymentReportOfficerUsers[username]) {
      return this.paymentReportOfficerUsers[username];
    }
    const collection = await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.USERS);
    const user = await collection.findOne({
      username: { $eq: username },
      roles: { $in: [ROLES.PAYMENT_REPORT_OFFICER] },
    });
    if (!user) {
      throw new Error(`Failed to find a payment report officer user with username '${username}'`);
    }
    this.paymentReportOfficerUsers[username] = user;
    return user;
  }

  /**
   * Gets a bank by bank id
   * @param bankId - The id of the bank
   * @returns The found bank
   * @throws {Error} If the bank cannot be found
   */
  public static async getBankByIdOrFail(bankId: string): Promise<Bank> {
    if (this.banks[bankId]) {
      return this.banks[bankId];
    }
    const banksCollection = await mongoDbClient.getCollection('banks');
    const bank = await banksCollection.findOne({ id: { $eq: bankId } });
    if (!bank) {
      throw new Error(`Failed to get bank with id`);
    }
    this.banks[bank.id] = bank;
    return bank;
  }
}
