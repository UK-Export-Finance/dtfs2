import { Collection, ObjectId, WithoutId, FindOneAndUpdateOptions } from 'mongodb';
import { InvalidDealIdError, MONGO_DB_COLLECTIONS, PortalUser, AuditDetails, USER_STATUS, OTP } from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { mongoDbClient } from '../../drivers/db-client';

/**
 * Gets the portal user with the supplied id
 * @param userId - The user id
 * @returns The found user
 * @throws {Error} If a user with the specified id cannot be found
 */
export const getUserById = async (userId: string): Promise<PortalUser> => {
  const usersCollection = await mongoDbClient.getCollection('users');
  const user = await usersCollection.findOne({ _id: { $eq: new ObjectId(userId) } });
  if (!user) {
    throw new Error(`Failed to find user with id ${userId}`);
  }
  return user;
};

export class PortalUsersRepo {
  private static async getUsersCollection(): Promise<Collection<WithoutId<PortalUser>>> {
    return await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.USERS);
  }

  /**
   * Update a facility by dealId
   * @param dealId - the deal that the facilities belong to
   * @param update - the updates to make
   * @param auditDetails - the users audit details
   */
  public static async incrementSignInOTPSendCount(userId: string | ObjectId, auditDetails: AuditDetails): Promise<number | undefined> {
    if (!ObjectId.isValid(userId)) {
      throw new InvalidDealIdError(userId.toString());
    }

    const userCollection = await this.getUsersCollection();

    const filter = { _id: { $eq: new ObjectId(userId) } };

    const update = {
      $inc: { signInOTPSendCount: 1 },
      $set: { auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails) },
    };

    const options: FindOneAndUpdateOptions = { returnDocument: 'after' };

    const userUpdate = await userCollection.findOneAndUpdate(filter, update, options);

    return userUpdate?.value?.signInOTPSendCount;
  }

  public static async setSignInLinkSendDate({ userId, auditDetails }: { userId: string; auditDetails: AuditDetails }): Promise<number | null> {
    if (!ObjectId.isValid(userId)) {
      throw new InvalidDealIdError(userId.toString());
    }

    const userCollection = await this.getUsersCollection();

    const filter = { _id: { $eq: new ObjectId(userId) } };

    const update = {
      $set: { signInOTPSendDate: Date.now(), auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails) },
    };

    const options: FindOneAndUpdateOptions = { returnDocument: 'after' };

    const userUpdate = await userCollection.findOneAndUpdate(filter, update, options);

    return userUpdate?.value?.signInOTPSendDate || null;
  }

  public static async blockUser({ userId, reason, auditDetails }: { userId: string; reason: string; auditDetails: AuditDetails }): Promise<void> {
    if (!ObjectId.isValid(userId)) {
      throw new InvalidDealIdError(userId.toString());
    }

    const userCollection = await this.getUsersCollection();

    const setUpdate = {
      'user-status': USER_STATUS.BLOCKED,
      blockedStatusReason: reason,
      auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
    };

    await userCollection.updateOne({ _id: { $eq: new ObjectId(userId) } }, { $set: setUpdate });
  }

  public static async resetSignInDataIfStale({
    userId,
    auditDetails,
  }: {
    userId: string;
    userSignInLinkSendDate: Date | null;
    auditDetails: AuditDetails;
  }): Promise<void> {
    if (!ObjectId.isValid(userId)) {
      throw new InvalidDealIdError(userId.toString());
    }

    const userCollection = await this.getUsersCollection();

    const filter = { _id: { $eq: new ObjectId(userId) } };

    const setUpdate = { signInOTPSendCount: 0, signInOTPSendDate: 0, auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails) };

    const update = {
      $set: setUpdate,
    };

    await userCollection.findOneAndUpdate(filter, update);
  }

  public static async saveSignInOTPTokenForUser({
    userId,
    saltHex,
    hashHex,
    expiry,
    auditDetails,
  }: {
    userId: string;
    saltHex: string;
    hashHex: string;
    expiry: number;
    auditDetails: AuditDetails;
  }): Promise<void> {
    if (!ObjectId.isValid(userId)) {
      throw new InvalidDealIdError(userId.toString());
    }

    const userCollection = await this.getUsersCollection();

    const update = {
      $push: { signInTokens: { $each: [{ hashHex, saltHex, expiry }], $slice: -OTP.MAX_SIGN_IN_ATTEMPTS } },
      $set: { auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails) },
    };

    await userCollection.updateOne({ _id: { $eq: new ObjectId(userId) } }, update);
  }
}
