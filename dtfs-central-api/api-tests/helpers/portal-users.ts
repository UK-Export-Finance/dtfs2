import { ObjectId } from 'mongodb';
import { MONGO_DB_COLLECTIONS, PortalUser } from '@ukef/dtfs2-common';
import { mongoDbClient as db } from '../../server/drivers/db-client';
import { aPortalUser } from '../../test-helpers';

/**
 * Inserts a portal user document directly into the `users` collection so that
 * `PortalUsersRepo` operations performed by controllers under test have a real document to update.
 */
export const insertPortalUser = async (overrides: Partial<PortalUser> = {}): Promise<PortalUser> => {
  const user = { ...aPortalUser(), ...overrides };

  const usersCollection = await db.getCollection(MONGO_DB_COLLECTIONS.USERS);
  const { insertedId } = await usersCollection.insertOne(user);

  return { ...user, _id: insertedId };
};

/**
 * Fetches the current persisted state of a user from the `users` collection.
 */
export const getPortalUser = async (userId: ObjectId): Promise<PortalUser> => {
  const usersCollection = await db.getCollection(MONGO_DB_COLLECTIONS.USERS);
  const user = await usersCollection.findOne({ _id: { $eq: userId } });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};
