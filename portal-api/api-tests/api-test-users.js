const api = require('./api');
const db = require('../src/drivers/db-client');
const { genPassword } = require('../src/crypto/utils');
const databaseHelper = require('./database-helper');
const { MAKER, CHECKER, ADMIN, READ_ONLY } = require('../src/v1/roles/roles');
const { createLoggedInUserSession } = require('../test-helpers/api-test-helpers/database/user-repository');
const { STATUS } = require('../src/constants/user');

const banks = {
  Barclays: {
    id: '956',
    name: 'Barclays Bank',
    emails: ['maker4@ukexportfinance.gov.uk', 'checker4@ukexportfinance.gov.uk'],
  },
  HSBC: {
    id: '961',
    name: 'HSBC',
    emails: ['maker1@ukexportfinance.gov.uk', 'maker2@ukexportfinance.gov.uk'],
  },
  LLOYDS: {
    id: '964',
    name: 'LLOYDS',
  },
  RBS: {
    id: '1004',
    name: 'RBS',
  },
  Santander: {
    id: '953',
    name: 'Santander',
  },
  UKEF: {
    id: '9',
    name: 'UKEF test bank (Delegated)',
    emails: ['maker1@ukexportfinance.gov.uk', 'checker1@ukexportfinance.gov.uk'],
  },
  any: {
    id: '*',
  },
};

const testUsers = [
  {
    firstname: 'first',
    surname: 'last',
    timezone: 'Europe/London',
    username: 'no-roles',
    email: 'no-roles@ukexportfinance.gov.uk',
    password: 'P@ssword1234',
    roles: [],
    bank: {},
  },
  {
    username: 'HSBC-maker-1',
    password: 'P@ssword1234',
    firstname: 'Mister',
    surname: 'One',
    email: 'one@email.com',
    timezone: 'Europe/London',
    roles: [MAKER],
    bank: banks.HSBC,
  },
  {
    username: 'HSBC-maker-2',
    password: 'P@ssword1234',
    firstname: 'Mister',
    surname: 'Two',
    email: 'two@email.com',
    timezone: 'Europe/London',
    roles: [MAKER],
    bank: banks.HSBC,
  },
  {
    username: 'Barclays-maker-1',
    password: 'P@ssword1234',
    firstname: 'Mister',
    surname: 'Three',
    email: 'three@email.com',
    timezone: 'Europe/London',
    roles: [MAKER],
    bank: banks.Barclays,
  },
  {
    username: 'Barclays-maker-2',
    password: 'P@ssword1234',
    firstname: 'Mister',
    surname: 'Four',
    email: 'four@email.com',
    timezone: 'Europe/London',
    roles: [MAKER],
    bank: banks.Barclays,
  },
  {
    username: 'Barclays-checker-1',
    password: 'P@ssword1234',
    firstname: 'Mister',
    surname: 'Five',
    email: 'five@email.com',
    timezone: 'Europe/London',
    roles: [CHECKER],
    bank: banks.Barclays,
  },
  {
    username: 'Barclays-read-only',
    password: 'P@ssword1234',
    firstname: 'Read Only',
    surname: 'Barclays',
    email: 'barclays-read-only@email.com',
    timezone: 'Europe/London',
    roles: [READ_ONLY],
    bank: banks.Barclays,
  },
  {
    username: 'Barclays-admin',
    password: 'P@ssword1234',
    firstname: 'Admin',
    surname: 'Barclays',
    email: 'barclays-admin@email.com',
    timezone: 'Europe/London',
    roles: [ADMIN],
    bank: banks.Barclays,
  },
  {
    username: 'Barclays-no-roles',
    password: 'P@ssword1234',
    firstname: 'No Roles',
    surname: 'Barclays',
    email: 'barclays-no-roles@email.com',
    timezone: 'Europe/London',
    roles: [],
    bank: banks.Barclays,
  },
  {
    username: 'Ukef-maker-1',
    password: 'P@ssword1234',
    firstname: 'Mister',
    surname: 'Six',
    email: 'six@email.com',
    timezone: 'Europe/London',
    roles: [MAKER],
    bank: banks.UKEF,
  },
  {
    username: 'super-user',
    password: 'P@ssword1234',
    firstname: 'Mister',
    surname: 'Seven',
    email: 'seven@email.com',
    timezone: 'Europe/London',
    roles: [MAKER],
    bank: banks.any,
  },
  {
    username: 'Barclays-maker-checker-1',
    password: 'P@ssword1234',
    firstname: 'Mister',
    surname: 'Nine',
    email: 'nine@email.com',
    timezone: 'Europe/London',
    roles: [MAKER, CHECKER],
    bank: banks.Barclays,
  },

  {
    username: 'maker-tfm',
    password: 'AbC!2345',
    firstname: 'First',
    surname: 'Last',
    email: 'maker@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    roles: [MAKER],
    bank: banks.UKEF,
  },
  {
    username: 'checker-tfm',
    password: 'AbC!2345',
    firstname: 'Mister',
    surname: 'Checker',
    email: 'checker@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    roles: [CHECKER],
    bank: banks.UKEF,
  },
];

let notYetInitialised = true;
const loadedUsers = [];

const finder = () => {
  let users = [...loadedUsers];

  const fluidBuilder = {
    all: () => users,
    one: () => users[0],
    withRole: (role) => {
      users = users.filter((user) => user.roles.includes(role));
      return fluidBuilder;
    },
    withMultipleRoles: (role1, role2) => {
      users = users.filter((user) => user.roles.includes(role1) && user.roles.includes(role2));
      return fluidBuilder;
    },
    withoutRole: (role) => {
      users = users.filter((user) => !user.roles.includes(role));
      return fluidBuilder;
    },
    withoutAnyRoles: () => {
      users = users.filter((user) => user.roles.length === 0);
      return fluidBuilder;
    },
    withBankName: (bankName) => {
      users = users.filter((user) => user.bank && user.bank.name === bankName);
      return fluidBuilder;
    },
    superuser: () => {
      users = users.filter((user) => user.bank && user.bank.id === '*');
      return fluidBuilder;
    },
  };

  return fluidBuilder;
};

const apiTestUser = {
  username: 'api-test-user',
  password: 'P@ssword1234',
  firstname: 'API',
  surname: 'Test User',
  email: 'api-tester@example.com',
  timezone: 'Europe/London',
  roles: [MAKER],
  bank: banks.any,
};

const loginTestUser = async (as, user) =>
  // Users are fully logged in by default
  createLoggedInUserSession(user);

const setUpApiTestUser = async (as) => {
  const { salt, hash } = genPassword(apiTestUser.password);

  const userToCreate = {
    'user-status': STATUS.ACTIVE,
    salt,
    hash,
    ...apiTestUser,
  };

  userToCreate.password = '';
  userToCreate.passwordConfirm = '';

  const collection = await db.getCollection('users');
  await collection.insertOne(userToCreate);

  const { token } = await loginTestUser(as, apiTestUser);
  return { token, ...userToCreate };
};

const initialise = async (app) => {
  if (notYetInitialised) {
    await databaseHelper.wipe(['users']);

    const { as } = api(app);

    // We create the api-test-user first
    const loggedInApiTestUser = await setUpApiTestUser(as);

    // We then set up all other test users
    for (const testUser of testUsers) {
      await as(loggedInApiTestUser).post(testUser).to('/v1/users/');
      const { token, userId } = await loginTestUser(as, testUser);
      loadedUsers.push({
        ...testUser,
        _id: userId,
        token,
      });
    }

    notYetInitialised = false;
  }

  return finder;
};

module.exports = {
  initialise,
  setUpApiTestUser,
};
