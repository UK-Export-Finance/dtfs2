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
// TODO: DTFS2-8249 - handle not found case and return null here
export const getUserById = async (userId: string): Promise<PortalUser> => {
  try {
    const usersCollection = await mongoDbClient.getCollection('users');

    const user = await usersCollection.findOne({ _id: { $eq: new ObjectId(userId) } });

    if (!user) {
      throw new Error(`Failed to find user with id ${userId}`);
    }

    return user;
  } catch (error) {
    console.error('Error fetching user by id %s: %o', userId, error);

    throw error;
  }
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
    try {
      console.info('Portal users repo - increment sign in OTP send count for user %s', userId.toString());

      if (!ObjectId.isValid(userId)) {
        console.error('Invalid user ID provided: %s', userId.toString());
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

      console.info('Incrementing sign in OTP send count for user %s', userId.toString());
      const userUpdate = await userCollection.findOneAndUpdate(filter, update, options);

      // return the updated signInOTPSendCount
      return userUpdate?.value?.signInOTPSendCount;
    } catch (error) {
      console.error('Error incrementing sign in OTP send count for user %s: %o', userId.toString(), error);

      throw error;
    }
  }

  /**
   * sets the sign in OTP send date for the user to current date
   * @param userId - ID of the user
   * @param auditDetails - the users audit details
   * @returns the updated signInOTPSendDate or null if not found
   */
  public static async setSignInOTPSendDate({ userId, auditDetails }: { userId: string; auditDetails: AuditDetails }): Promise<number | null> {
    try {
      console.info('Portal users repo - set sign in OTP send date for user %s', userId.toString());

      if (!ObjectId.isValid(userId)) {
        console.error('Invalid user ID provided: %s', userId.toString());
        throw new InvalidUserIdError(userId.toString());
      }

      const userCollection = await this.getUsersCollection();

      const filter = { _id: { $eq: new ObjectId(userId) } };

      const update = {
        $set: { signInOTPSendDate: Date.now(), auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails) },
      };

      // returns the document after updating
      const options: FindOneAndUpdateOptions = { returnDocument: 'after' };

      console.info('Setting sign in OTP send date for user %s', userId.toString());
      const userUpdate = await userCollection.findOneAndUpdate(filter, update, options);

      return userUpdate?.value?.signInOTPSendDate || null;
    } catch (error) {
      console.error('Error setting sign in OTP send date for user %s: %o', userId.toString(), error);

      throw error;
    }
  }

  /**
   * blocks the user with the provided reason
   * @param userId - ID of the user
   * @param reason - reason for blocking the user
   * @param auditDetails - the users audit details
   */
  public static async blockUser({ userId, reason, auditDetails }: { userId: string; reason: string; auditDetails: AuditDetails }): Promise<void> {
    try {
      console.info('Portal users repo - block user %s', userId.toString());

      if (!ObjectId.isValid(userId)) {
        console.error('Invalid user ID provided: %s', userId.toString());
        throw new InvalidUserIdError(userId.toString());
      }

      const userCollection = await this.getUsersCollection();

      const setUpdate = {
        'user-status': USER_STATUS.BLOCKED,
        blockedStatusReason: reason,
        auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
      };

      console.info('Blocking user %s for reason: %s', userId.toString(), reason);
      await userCollection.updateOne({ _id: { $eq: new ObjectId(userId) } }, { $set: setUpdate });
    } catch (error) {
      console.error('Error blocking user %s: %o', userId.toString(), error);

      throw error;
    }
  }

  /**
   * resets the sign in data for the user
   * sets signInOTPSendCount to 0 and signInOTPSendDate to 0 and clears signInTokens array
   * @param userId - ID of the user
   * @param auditDetails - the users audit details
   */
  public static async resetSignInData({ userId, auditDetails }: { userId: string; signInOTPSendDate?: Date; auditDetails: AuditDetails }): Promise<void> {
    try {
      console.info('Portal users repo - reset sign in data for user %s', userId.toString());

      if (!ObjectId.isValid(userId)) {
        console.error('Invalid user ID provided: %s', userId.toString());
        throw new InvalidUserIdError(userId.toString());
      }

      const userCollection = await this.getUsersCollection();

      const filter = { _id: { $eq: new ObjectId(userId) } };

      const setUpdate = {
        signInOTPSendCount: 0,
        signInOTPSendDate: 0,
        signInTokens: [],
        auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
      };

      const update = {
        $set: setUpdate,
      };

      console.info('Resetting sign in data for user %s', userId.toString());
      await userCollection.findOneAndUpdate(filter, update);
    } catch (error) {
      console.error('Error resetting sign in data for user %s: %o', userId.toString(), error);

      throw error;
    }
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
    try {
      console.info('Portal users repo - save sign in OTP token for user %s', userId.toString());

      if (!ObjectId.isValid(userId)) {
        console.error('Invalid user ID provided: %s', userId.toString());
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

      console.info('Saving sign in OTP token for user %s', userId.toString());
      await userCollection.updateOne({ _id: { $eq: new ObjectId(userId) } }, update);
    } catch (error) {
      console.error('Error saving sign in OTP token for user %s: %o', userId.toString(), error);

      throw error;
    }
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
    try {
      console.info('Portal users repo - update last login and reset sign in data for user %s', userId.toString());

      if (!ObjectId.isValid(userId)) {
        console.error('Invalid user ID provided: %s', userId.toString());
        throw new InvalidUserIdError(userId.toString());
      }

      if (!sessionIdentifier) {
        console.error('Invalid session identifier provided: %s', sessionIdentifier);
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

      console.info('Updating user %s with last login and resetting sign in data', userId.toString());
      await userCollection.updateOne({ _id: { $eq: new ObjectId(userId) } }, { $set: setUpdate });
    } catch (error) {
      console.error('Error updating last login and resetting sign in data for user %s: %o', userId.toString(), error);

      throw error;
    }
  }
}
