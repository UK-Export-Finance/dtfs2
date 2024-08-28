import { Collection, WithoutId, ObjectId } from 'mongodb';
import { MONGO_DB_COLLECTIONS, TfmUser } from '@ukef/dtfs2-common';
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
}
