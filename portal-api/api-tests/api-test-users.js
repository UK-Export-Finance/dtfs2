const api = require('./api');
const { mongoDbClient: db } = require('../src/drivers/db-client');
const { genPassword } = require('../src/crypto/utils');
const databaseHelper = require('./database-helper');
const { MAKER, CHECKER, ADMIN, READ_ONLY, PAYMENT_REPORT_OFFICER } = require('../src/v1/roles/roles');
const { DB_COLLECTIONS } = require('./fixtures/constants');
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
    username: 'hsbc-maker-1@ukexportfinance.gov.uk',
    password: 'P@ssword1234',
    firstname: 'Mister',
    surname: 'One',
    email: 'hsbc-maker-1@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    roles: [MAKER],
    bank: banks.HSBC,
    isTrusted: false,
  },
  {
    username: 'hsbc-maker-2@ukexportfinance.gov.uk',
    password: 'P@ssword1234',
    firstname: 'Mister',
    surname: 'Two',
    email: 'hsbc-maker-2@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    roles: [MAKER],
    bank: banks.HSBC,
    isTrusted: false,
  },
  {
    username: 'hsbc-payment-report-officer@ukexportfinance.gov.uk',
    password: 'P@ssword1234',
    firstname: 'Mister',
    surname: 'Three',
    email: 'hsbc-payment-report-officer@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    roles: [PAYMENT_REPORT_OFFICER],
    bank: banks.HSBC,
    isTrusted: false,
  },
  {
    username: 'barclays-maker-1@ukexportfinance.gov.uk',
    password: 'P@ssword1234',
    firstname: 'Mister',
    surname: 'Three',
    email: 'barclays-maker-1@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    roles: [MAKER],
    bank: banks.Barclays,
    isTrusted: false,
  },
  {
    username: 'barclays-maker-2@ukexportfinance.gov.uk',
    password: 'P@ssword1234',
    firstname: 'Mister',
    surname: 'Four',
    email: 'barclays-maker-2@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    roles: [MAKER],
    bank: banks.Barclays,
    isTrusted: false,
  },
  {
    username: 'barclays-checker-1@ukexportfinance.gov.uk',
    password: 'P@ssword1234',
    firstname: 'Mister',
    surname: 'Five',
    email: 'barclays-checker-1@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    roles: [CHECKER],
    bank: banks.Barclays,
    isTrusted: false,
  },
  {
    username: 'barclays-read-only@ukexportfinance.gov.uk',
    password: 'P@ssword1234',
    firstname: 'Read Only',
    surname: 'barclays',
    email: 'barclays-read-only@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    roles: [READ_ONLY],
    bank: banks.Barclays,
    isTrusted: false,
  },
  {
    username: 'barclays-admin@ukexportfinance.gov.uk',
    password: 'P@ssword1234',
    firstname: 'Admin',
    surname: 'barclays',
    email: 'barclays-admin@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    roles: [ADMIN],
    bank: banks.Barclays,
    isTrusted: false,
  },
  {
    username: 'barclays-payment-officer@ukexportfinance.gov.uk',
    password: 'P@ssword1234',
    firstname: 'Payton',
    surname: 'Archer',
    email: 'barclays-payment-officer@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    roles: [PAYMENT_REPORT_OFFICER],
    bank: banks.Barclays,
    isTrusted: false,
  },
  {
    username: 'Ukef-maker-1@ukexportfinance.gov.uk',
    password: 'P@ssword1234',
    firstname: 'Mister',
    surname: 'Six',
    email: 'Ukef-maker-1@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    roles: [MAKER],
    bank: banks.UKEF,
    isTrusted: false,
  },
  {
    username: 'ukef-payment-report-officer@ukexportfinance.gov.uk',
    password: 'AbC!2345',
    firstname: 'Payton',
    surname: 'Archer',
    email: 'ukef-payment-report-officer@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    roles: [PAYMENT_REPORT_OFFICER],
    bank: banks.UKEF,
    isTrusted: false,
  },
  {
    username: 'any-bank-super-user@ukexportfinance.gov.uk',
    password: 'P@ssword1234',
    firstname: 'Mister',
    surname: 'Seven',
    email: 'any-bank-super-user@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    roles: [MAKER],
    bank: banks.any,
    isTrusted: false,
  },
  {
    username: 'barclays-maker-checker-1@ukexportfinance.gov.uk',
    password: 'P@ssword1234',
    firstname: 'Mister',
    surname: 'Nine',
    email: 'barclays-maker-checker-1@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    roles: [MAKER, CHECKER],
    isTrusted: false,
    bank: banks.Barclays,
  },

  {
    username: 'ukef-maker@ukexportfinance.gov.uk',
    password: 'AbC!2345',
    firstname: 'First',
    surname: 'Last',
    email: 'ukef-maker@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    roles: [MAKER],
    bank: banks.UKEF,
    isTrusted: false,
  },
  {
    username: 'ukef-checker-tfm@ukexportfinance.gov.uk',
    password: 'AbC!2345',
    firstname: 'Mister',
    surname: 'Checker',
    email: 'ukef-checker-tfm@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    roles: [CHECKER],
    bank: banks.UKEF,
    isTrusted: false,
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
  username: 'api-tester@ukexportfinance.gov.uk',
  password: 'P@ssword1234',
  firstname: 'API',
  surname: 'Test User',
  email: 'api-tester@ukexportfinance.gov.uk',
  timezone: 'Europe/London',
  roles: [MAKER],
  bank: banks.any,
  isTrusted: false,
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

  const collection = await db.getCollection(DB_COLLECTIONS.USERS);
  await collection.insertOne(userToCreate);

  const { token } = await loginTestUser(as, apiTestUser);
  return { token, ...userToCreate };
};

const initialise = async (app) => {
  if (notYetInitialised) {
    await databaseHelper.wipe([DB_COLLECTIONS.USERS]);

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
