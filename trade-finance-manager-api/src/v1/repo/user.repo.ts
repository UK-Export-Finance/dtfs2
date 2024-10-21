import escapeStringRegexp from 'escape-string-regexp';
import { AuditDetails, MONGO_DB_COLLECTIONS, MultipleUsersFoundError, TfmUser, UserUpsertRequest } from '@ukef/dtfs2-common';
import { Collection, FindOneAndUpdateOptions, WithoutId } from 'mongodb';
import { generateAuditDatabaseRecordFromAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { mongoDbClient } from '../../drivers/db-client';

type UpsertUserParams = {
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
  private static generateArrayOfEmailsRegex(emails: string[]) {
    return emails.map((email) => new RegExp(`^${escapeStringRegexp(email)}$`, 'i'));
  }

  /**
   * Upserts a user
   * If there are multiple users with the provided emails, an error will be thrown
   * If there are no users found, an error will be thrown
   * @param upsertUserParams
   * @param upsertUserParams.upsertUserRequest the upsert user request
   * @param upsertUserParams.emailsOfUserToUpsert the emails of the user to update, used to identify the tfm user
   * @param upsertUserParams.auditDetails the audit details
   * @returns upserted user
   */
  public static async upsertUser({ emailsOfUserToUpsert, userUpsertRequest, auditDetails }: UpsertUserParams): Promise<TfmUser> {
    const collection = await this.getCollection();

    const userUpsert = {
      ...userUpsertRequest,
      auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
    };

    const emailsRegex = this.generateArrayOfEmailsRegex(emailsOfUserToUpsert);

    const query = { email: { $in: emailsRegex } };

    const findResult = await collection.find(query).toArray();
    if (findResult.length > 1) {
      throw new MultipleUsersFoundError({ userIdsFound: findResult.map((user) => user._id.toString()) });
    }

    const update = { $set: userUpsert };
    const options: FindOneAndUpdateOptions = { upsert: true, returnDocument: 'after' };

    const upsertResult = await collection.findOneAndUpdate(query, update, options); // TODO: DTFS2-6892: Test this fails if there are multiple users
    if (!upsertResult.value || !upsertResult.ok) {
      throw new Error('Failed to upsert user');
    }
    return upsertResult.value;
  }
}
