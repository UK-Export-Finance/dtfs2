const api = require('../../api');

const banks = {
  Barclays: {
    id: '956',
    name: 'Barclays Bank',
    emails: [
      'maker4@ukexportfinance.gov.uk',
      'checker4@ukexportfinance.gov.uk',
    ],
  },
  HSBC: {
    id: '961',
    name: 'HSBC',
    emails: [
      'maker1@ukexportfinance.gov.uk',
      'maker2@ukexportfinance.gov.uk',
    ],
  },
  UKEF: {
    id: '9',
    name: 'UKEF test bank (Delegated)',
    emails: [
      'maker1@ukexportfinance.gov.uk',
      'checker1@ukexportfinance.gov.uk',
    ],
  },
  any: {
    id: '*',
  },
};

const testUsers = [
  { username: 'no-roles', password: 'P@ssword1234', roles: [] },
  { username: 'an-editor', password: 'P@ssword1234', roles: ['editor'] },
  {
    username: 'HSBC-maker-1',
    password: 'P@ssword1234',
    firstname: 'Mister',
    surname: 'One',
    email: 'one@email.com',
    timezone: 'Europe/London',
    roles: ['maker'],
    bank: banks.HSBC,
  },
  {
    username: 'Barclays-checker-1',
    password: 'P@ssword1234',
    firstname: 'Mister',
    surname: 'Five',
    email: 'five@email.com',
    timezone: 'Europe/London',
    roles: ['checker'],
    bank: banks.Barclays,
  },
  {
    username: 'super-user',
    password: 'P@ssword1234',
    firstname: 'Mister',
    surname: 'Seven',
    email: 'seven@email.com',
    timezone: 'Europe/London',
    roles: ['maker'],
    bank: banks.any,
  },
  {
    username: 'data-admin',
    password: 'P@ssword1234',
    firstname: 'Mister',
    surname: 'Eight',
    email: 'eight@email.com',
    timezone: 'Europe/London',
    roles: ['data-admin'],
  },
  {
    username: 'Barclays-maker-checker-1',
    password: 'P@ssword1234',
    firstname: 'Mister',
    surname: 'Nine',
    email: 'nine@email.com',
    timezone: 'Europe/London',
    roles: ['maker', 'checker'],
    bank: banks.Barclays,
  },

  {
    username: 'maker-tfm',
    password: 'AbC!2345',
    firstname: 'Tamil',
    surname: 'Rahani',
    email: 'maker@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    roles: ['maker'],
    bank: banks.UKEF,
  },
  {
    username: 'checker-tfm',
    password: 'AbC!2345',
    firstname: 'Nikolaevich',
    surname: 'Chernov',
    email: 'checker@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    roles: ['checker'],
    bank: {
      ...banks.UKEF,
      useTFM: true,
    },
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

module.exports.initialise = async (app) => {
  if (notYetInitialised) {
    const {
      get, post, put, remove,
    } = api(app).as();

    const currentUsersResponse = await get('/v1/user');
    const existingUsers = currentUsersResponse.body.users;

    for (const existingUser of existingUsers) {
      await remove(`/v1/users/${existingUser._id}`);
    }

    for (const testUser of testUsers) {
      const { body } = await post(testUser).to('/v1/user/');

      loadedUsers.push({
        ...testUser,
        _id: body._id,
      });
    }

    notYetInitialised = false;
  }

  return finder;
};
