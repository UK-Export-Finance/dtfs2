import { Collection, ObjectId, WithoutId, FindOneAndUpdateOptions } from 'mongodb';
import { InvalidUserIdError, InvalidSessionIdentifierError, MONGO_DB_COLLECTIONS, PortalUser, AuditDetails, USER_STATUS, OTP } from '@ukef/dtfs2-common';
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
   * Increments the sign in OTP send count for the user
   * @param userId - the ID of the user
   * @param auditDetails - the users audit details
   */
  public static async incrementSignInOTPSendCount(userId: string | ObjectId, auditDetails: AuditDetails): Promise<number | undefined> {
    if (!ObjectId.isValid(userId)) {
      throw new InvalidUserIdError(userId.toString());
    }

    const userCollection = await this.getUsersCollection();

    const filter = { _id: { $eq: new ObjectId(userId) } };

    // increments the signInOTPSendCount by 1 and sets the audit record
    const update = {
      $inc: { signInOTPSendCount: 1 },
      $set: { auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails) },
    };

    // returns the document after updating
    const options: FindOneAndUpdateOptions = { returnDocument: 'after' };

    const userUpdate = await userCollection.findOneAndUpdate(filter, update, options);

    // return the updated signInOTPSendCount
    return userUpdate?.value?.signInOTPSendCount;
  }

  /**
   * sets the sign in OTP send date for the user to current date
   * @param userId - ID of the user
   * @param auditDetails - the users audit details
   * @returns the updated signInOTPSendDate or null if not found
   */
  public static async setSignInLinkSendDate({ userId, auditDetails }: { userId: string; auditDetails: AuditDetails }): Promise<number | null> {
    if (!ObjectId.isValid(userId)) {
      throw new InvalidUserIdError(userId.toString());
    }

    const userCollection = await this.getUsersCollection();

    const filter = { _id: { $eq: new ObjectId(userId) } };

    const update = {
      $set: { signInOTPSendDate: Date.now(), auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails) },
    };

    // returns the document after updating
    const options: FindOneAndUpdateOptions = { returnDocument: 'after' };

    const userUpdate = await userCollection.findOneAndUpdate(filter, update, options);

    return userUpdate?.value?.signInOTPSendDate || null;
  }

  /**
   * blocks the user with the provided reason
   * @param userId - ID of the user
   * @param reason - reason for blocking the user
   * @param auditDetails - the users audit details
   */
  public static async blockUser({ userId, reason, auditDetails }: { userId: string; reason: string; auditDetails: AuditDetails }): Promise<void> {
    if (!ObjectId.isValid(userId)) {
      throw new InvalidUserIdError(userId.toString());
    }

    const userCollection = await this.getUsersCollection();

    const setUpdate = {
      'user-status': USER_STATUS.BLOCKED,
      blockedStatusReason: reason,
      auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
    };

    await userCollection.updateOne({ _id: { $eq: new ObjectId(userId) } }, { $set: setUpdate });
  }

  /**
   * resets the sign in data for the user
   * sets signInOTPSendCount to 0 and signInOTPSendDate to 0 and clears signInTokens array
   * @param userId - ID of the user
   * @param auditDetails - the users audit details
   */
  public static async resetSignInData({ userId, auditDetails }: { userId: string; signInOTPSendDate: Date | null; auditDetails: AuditDetails }): Promise<void> {
    if (!ObjectId.isValid(userId)) {
      throw new InvalidUserIdError(userId.toString());
    }

    const userCollection = await this.getUsersCollection();

    const filter = { _id: { $eq: new ObjectId(userId) } };

    const setUpdate = { signInOTPSendCount: 0, signInOTPSendDate: 0, signInTokens: [], auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails) };

    const update = {
      $set: setUpdate,
    };

    await userCollection.findOneAndUpdate(filter, update);
  }

  /**
   * saves the sign in OTP data for the user
   * @param userId - ID of the user
   * @param saltHex - salt used for hashing the OTP
   * @param hashHex - hashed OTP
   * @param expiry - expiry date of the OTP
   * @param auditDetails - the users audit details
   */
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
      throw new InvalidUserIdError(userId.toString());
    }

    const userCollection = await this.getUsersCollection();

    /**
     * Pushes the new sign in token to the signInTokens array
     * in the latest position, and keeps only the latest MAX_SIGN_IN_ATTEMPTS tokens
     */
    const update = {
      $push: { signInTokens: { $each: [{ hashHex, saltHex, expiry }], $slice: -OTP.MAX_SIGN_IN_ATTEMPTS } },
      $set: { auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails) },
    };

    await userCollection.updateOne({ _id: { $eq: new ObjectId(userId) } }, update);
  }

  /**
   * updates the last login date and session identifier for the user
   * also resets the sign in data for the user
   * @param userId - ID of the user
   * @param sessionIdentifier - new session identifier for the user
   * @param auditDetails - the users audit details
   */
  public static async updateLastLoginAndResetSignInData({
    userId,
    sessionIdentifier,
    auditDetails,
  }: {
    userId: string;
    sessionIdentifier: string;
    auditDetails: AuditDetails;
  }): Promise<void> {
    if (!ObjectId.isValid(userId)) {
      throw new InvalidUserIdError(userId.toString());
    }

    if (!sessionIdentifier) {
      throw new InvalidSessionIdentifierError(sessionIdentifier);
    }

    const userCollection = await this.getUsersCollection();

    const setUpdate = {
      lastLogin: Date.now(),
      loginFailureCount: 0,
      sessionIdentifier,
      auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
      signInOTPSendCount: 0,
      signInOTPSendDate: 0,
      signInTokens: [],
    };

    await userCollection.updateOne({ _id: { $eq: new ObjectId(userId) } }, { $set: setUpdate });
  }
}
