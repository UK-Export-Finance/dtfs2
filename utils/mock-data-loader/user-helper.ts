import { ObjectId } from 'mongodb';
import { Bank, PortalUser, ROLES } from '@ukef/dtfs2-common';
import api from './api';
import { logger } from './helpers/logger.helper';
import { mongoDbClient } from './database/database-client';

const mockDataLoaderUser: PortalUser = {
  _id: new ObjectId(),
  username: 're-insert-mocks-data-loader@ukexportfinance.gov.uk',
  salt: '',
  hash: '',
  firstname: 'Mock',
  surname: 'DataLoader',
  roles: [ROLES.MAKER, ROLES.ADMIN],
  email: 're-insert-mocks-data-loader@ukexportfinance.gov.uk',
  bank: { id: '*' } as Bank,
  timezone: 'Europe/London',
  'user-status': 'active',
};

export const createAndLogInAsInitialUser = async (): Promise<string> => {
  logger.info('logging in as initial portal user');
  const usersCollection = await mongoDbClient.getCollection('users');
  await usersCollection.insertOne(mockDataLoaderUser);
  return await api.loginViaPortal(mockDataLoaderUser);
};

export const deleteInitialUser = async (): Promise<void> => {
  logger.info('deleting initial Portal user');
  const usersCollection = await mongoDbClient.getCollection('users');
  await usersCollection.deleteOne({ _id: { $eq: mockDataLoaderUser._id } });
};

export const findPortalUserIdByUsernameOrFail = async (username: string): Promise<ObjectId> => {
  const usersCollection = await mongoDbClient.getCollection('users');
  const user = await usersCollection.findOne({ username: { $eq: username } });
  if (!user) {
    throw new Error(`Failed to find a portal user with username '${username}'`);
  }
  return user._id;
};
