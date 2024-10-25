import escapeStringRegexp from 'escape-string-regexp';
import { AuditDetails, DocumentNotCreatedError, DocumentNotUpdatedError, MONGO_DB_COLLECTIONS, TfmUser, UserUpsertRequest } from '@ukef/dtfs2-common';
import { Collection, FindOneAndUpdateOptions, ObjectId, WithoutId } from 'mongodb';
import { generateAuditDatabaseRecordFromAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { mongoDbClient } from '../../drivers/db-client';
import { USER } from '../../constants';

export type upsertUserByEmailAddressesParams = {
  emailsOfUserToUpsert: string[];
  userUpsertRequest: UserUpsertRequest;
  auditDetails: AuditDetails;
};

export class UserRepo {
  /**
   * Gets the tfm users collection
   * @returns The collection
   */
  private static async getCollection(): Promise<Collection<WithoutId<TfmUser>>> {
    return await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.TFM_USERS);
  }

  /**
   * generateArrayOfEmailsRegex
   * Generate an array of emails as regular expressions.
   * This is used to find users with matching emails.
   * @param {string[]} emails
   * @returns {RegExp[]} Emails as regular expressions.
   */
  public static generateArrayOfEmailsRegex(emails: string[]) {
    return emails.map((email) => new RegExp(`^${escapeStringRegexp(email)}$`, 'i'));
  }

  public static async findUsersByEmailAddresses(emails: string[]): Promise<TfmUser[]> {
    const collection = await UserRepo.getCollection();

    const emailsRegex = UserRepo.generateArrayOfEmailsRegex(emails);

    const query = { email: { $in: emailsRegex } };

    return await collection.find(query).toArray();
  }

  public static async createUser({ user, auditDetails }: { user: UserUpsertRequest; auditDetails: AuditDetails }): Promise<TfmUser> {
    const collection = await UserRepo.getCollection();

    const userToCreate: WithoutId<TfmUser> = {
      ...user,
      auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
      status: USER.STATUS.ACTIVE, // New users start in an active state
    };

    const result = await collection.insertOne(userToCreate);

    if (!result.acknowledged) {
      throw new DocumentNotCreatedError();
    }

    return { _id: result.insertedId, ...userToCreate };
  }

  public static async updateUserById({
    userId,
    userUpdate,
    auditDetails,
  }: {
    userId: string | ObjectId;
    userUpdate: UserUpsertRequest;
    auditDetails: AuditDetails;
  }) {
    const collection = await UserRepo.getCollection();

    const filter = { _id: { $eq: new ObjectId(userId.toString()) } };
    const update = {
      $set: {
        ...userUpdate,
        auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
      },
    };
    const options: FindOneAndUpdateOptions = { returnDocument: 'after' };

    const result = await collection.findOneAndUpdate(filter, update, options);

    if (!result.ok || !result.value) {
      throw new DocumentNotUpdatedError(userId.toString());
    }

    return result.value;
  }
}
