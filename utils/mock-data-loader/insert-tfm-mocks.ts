import { WithoutId } from 'mongodb';
import { TeamId, TfmUser } from '@ukef/dtfs2-common';
import { mongoDbClient } from './database/database-client';
import { MockTfmUser, TEAMS, USERS } from './tfm-mocks';
import { generateSaltAndHash, logger } from './helpers';

export const mapMockTfmUserToTfmUser = (mockUser: MockTfmUser): WithoutId<TfmUser> => ({
  username: mockUser.username,
  email: mockUser.email,
  teams: mockUser.teams as TeamId[],
  timezone: mockUser.timezone,
  firstName: mockUser.firstName,
  lastName: mockUser.lastName,
  status: 'active',
  ...generateSaltAndHash(mockUser.password),
});

export const insertTfmMocks = async () => {
  logger.info('inserting TFM mocks');

  logger.info('inserting TFM teams', { depth: 1 });
  const teamsCollection = await mongoDbClient.getCollection('tfm-teams');
  await teamsCollection.insertMany(Object.values(TEAMS));

  logger.info('inserting TFM users', { depth: 1 });
  const tfmUsersCollection = await mongoDbClient.getCollection('tfm-users');
  await tfmUsersCollection.insertMany(Object.values(USERS).map(mapMockTfmUserToTfmUser));
};
