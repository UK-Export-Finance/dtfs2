import { PortalUser } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { mongoDbClient } from '../database-client';

export const getPortalUserIdOrFail = async (): Promise<ObjectId> => {
  const usersCollection = await mongoDbClient.getCollection('users');
  const portalUser: PortalUser | null = await usersCollection.findOne({});
  if (!portalUser) {
    throw new Error(`Failed to get a portal user`);
  }
  return portalUser._id;
};
