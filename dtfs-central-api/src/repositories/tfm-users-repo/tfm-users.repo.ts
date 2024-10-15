import { Collection, WithoutId, ObjectId } from 'mongodb';
import { AuditDetails, MONGO_DB_COLLECTIONS, TfmUser, UserUpsertRequest } from '@ukef/dtfs2-common';
import { generateAuditDatabaseRecordFromAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { mongoDbClient } from '../../drivers/db-client';

export class TfmUsersRepo {
  /**
   * Gets the tfm users collection
   * @returns The collection
   */
  private static async getCollection(): Promise<Collection<WithoutId<TfmUser>>> {
    return mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.TFM_USERS);
  }

  /**
   * Finds a user by id
   * @param id - The user id
   * @returns The found user
   */
  public static async findOneUserById(id: string | ObjectId): Promise<TfmUser | null> {
    const collection = await this.getCollection();
    return collection.findOne({ _id: new ObjectId(id) });
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
