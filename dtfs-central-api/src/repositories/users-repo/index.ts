import { ObjectId } from 'mongodb';
import { PortalUser } from '@ukef/dtfs2-common';
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
