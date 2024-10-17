import { AuditDetails, MONGO_DB_COLLECTIONS, TfmUser, UserUpsertRequest } from '@ukef/dtfs2-common';
import { Collection, WithoutId } from 'mongodb';
import { generateAuditDatabaseRecordFromAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { mongoDbClient } from '../../drivers/db-client';

export class UserRepo {
  /**
   * Gets the tfm users collection
   * @returns The collection
   */
  private static async getCollection(): Promise<Collection<WithoutId<TfmUser>>> {
    return await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.TFM_USERS);
  }

  /**
   * Upserts a user
   * @param upsertUserRequest
   * @returns upserted user
   */
  public static async upsertUser({ userUpdate, auditDetails }: { userUpdate: UserUpsertRequest; auditDetails: AuditDetails }): Promise<void> {
    const collection = await this.getCollection();

    const userUpsert = {
      ...userUpdate,
      auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
    };

    const query = { name: 'To Update' }; // TODO: DTFS2-6892: This should be updated as part of this ticket
    const update = { $set: userUpsert };
    const options = { upsert: true };
    await collection.updateOne(query, update, options); // TODO: DTFS2-6892: Test this fails if there are multiple users
  }
}
