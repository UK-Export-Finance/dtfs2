import { WithoutId } from 'mongodb';
import { cloneDeep } from 'lodash';
import { MONGO_DB_COLLECTIONS, TeamId, TfmUser } from '@ukef/dtfs2-common';
import { createApi } from './api';
import MOCK_USERS from '../src/v1/__mocks__/mock-users';
import { TestUser } from './types/test-user';
import { wipeCollection } from './database-helper';
import { genPassword } from '../src/utils/crypto.util';
import { mongoDbClient } from '../src/drivers/db-client';
import { STATUS as USER_STATUS } from '../src/constants/user';
import { TestAs, TestRequestWithoutHeaders } from './types/test-api';

type MockUserWithoutTokenOrId = Omit<TestUser, 'token' | '_id'>;

const loadedUsers: TestUser[] = [];
let notYetInitialised = true;

/**
 * Fluent builder to get a user
 */
const fluentBuilder = (users: TestUser[]) => ({
  all: () => users,
  one: () => users[0],
  withTeam: (team: TeamId) => {
    const filteredUsers = users.filter((user) => user.teams.includes(team));
    return fluentBuilder(filteredUsers);
  },
  withoutTeam: (team: TeamId) => {
    const filteredUsers = users.filter((user) => !user.teams.includes(team));
    return fluentBuilder(filteredUsers);
  },
});

/**
 * Log in test user
 * @param post - supertest post function
 * @param user  - user to log in as
 * @returns token & userId of the now logged in user
 */
const loginTestUser = async (post: TestRequestWithoutHeaders, user: MockUserWithoutTokenOrId): Promise<{ token: string; userId: string }> => {
  const loginResponse = await post({ username: user.username, password: user.password }).to('/v1/login');

  const {
    token,
    user: { _id: userId },
  } = loginResponse.body as { token: string; user: { _id: string } };

  return { token, userId };
};

const apiTestUser: MockUserWithoutTokenOrId = {
  username: 'api-tester@ukexportfinance.gov.uk',
  password: 'P@ssword1234',
  firstName: 'API',
  lastName: 'Test User',
  email: 'api-tester@ukexportfinance.gov.uk',
  timezone: 'Europe/London',
  teams: [],
};

/**
 * Create the initial test user by direct database insertion
 * @param user - user to insert
 */
const createInitialTestUser = async (user: MockUserWithoutTokenOrId) => {
  const saltHash = genPassword(user.password);

  const userToInsert: WithoutId<TfmUser> = {
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    timezone: user.timezone,
    teams: user.teams,
    ...saltHash,
    status: USER_STATUS.ACTIVE,
  };

  const collection = await mongoDbClient.getCollection('tfm-users');
  await collection.insertOne(userToInsert);
};

/**
 * Create tests user with an initial user token
 * @param params
 * @param params.user - user to create
 * @param params.as - supertest as user
 * @param params.initialuser - already created initial user with token
 */
const createTestUser = async ({ user, as, initialUser }: { user: MockUserWithoutTokenOrId; as: TestAs; initialUser: TestUser }) =>
  as(initialUser).post(user).to('/v1/users');

/**
 * Initialises the test users
 * @param app - express app
 * @returns fluent builder to access users
 */
export const initialiseTestUsers = async (app: unknown) => {
  const { post, as } = createApi(app);

  if (notYetInitialised) {
    await wipeCollection([MONGO_DB_COLLECTIONS.TFM_USERS]);

    // Insert the initial user
    await createInitialTestUser(apiTestUser);
    const { token, userId } = await loginTestUser(post, apiTestUser);
    const initialUser = { ...apiTestUser, token, _id: userId };

    // Using the initial user, insert the mock users
    const users = await Promise.all(
      (MOCK_USERS as TestUser[]).map(async (user) => {
        const userToInsert = cloneDeep(user);

        delete userToInsert._id;

        await createTestUser({ user: userToInsert, as, initialUser });

        const { token: loggedInUserToken, userId: loggedInUserId } = await loginTestUser(post, user);

        return { ...user, token: loggedInUserToken, _id: loggedInUserId };
      }),
    );

    loadedUsers.push(...users);

    notYetInitialised = false;
  }

  return () => fluentBuilder(loadedUsers);
};
