const api = require('./api');

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
    username: 'HSBC-maker-2',
    password: 'P@ssword1234',
    firstname: 'Mister',
    surname: 'Two',
    email: 'two@email.com',
    timezone: 'Europe/London',
    roles: ['maker'],
    bank: banks.HSBC,
  },
  {
    username: 'Barclays-maker-1',
    password: 'P@ssword1234',
    firstname: 'Mister',
    surname: 'Three',
    email: 'three@email.com',
    timezone: 'Europe/London',
    roles: ['maker'],
    bank: banks.Barclays,
  },
  {
    username: 'Barclays-maker-2',
    password: 'P@ssword1234',
    firstname: 'Mister',
    surname: 'Four',
    email: 'four@email.com',
    timezone: 'Europe/London',
    roles: ['maker'],
    bank: banks.Barclays,
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
    username: 'Ukef-maker-1',
    password: 'P@ssword1234',
    firstname: 'Mister',
    surname: 'Six',
    email: 'six@email.com',
    timezone: 'Europe/London',
    roles: ['maker'],
    bank: banks.UKEF,
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
    bank: banks.UKEF,
  },
];

let notYetInitialised = true;
const loadedUsers = [];

const finder = () => {
  let users = [...loadedUsers];

  // console.log(`initial: ${JSON.stringify(users)}`)

  const fluidBuilder = {
    all: () => users,
    one: () => users[0],
    withRole: (role) => {
      users = users.filter((user) => user.roles.includes(role));
      // console.log(`withRole ${role} => ${JSON.stringify(users)}`)
      return fluidBuilder;
    },
    withMultipleRoles: (role1, role2) => {
      users = users.filter((user) => user.roles.includes(role1) && user.roles.includes(role2));
      // console.log(`withRole ${role} => ${JSON.stringify(users)}`)
      return fluidBuilder;
    },
    withoutRole: (role) => {
      users = users.filter((user) => !user.roles.includes(role));
      // console.log(`withoutRole ${role} => ${JSON.stringify(users)}`)
      return fluidBuilder;
    },
    withoutAnyRoles: () => {
      users = users.filter((user) => user.roles.length === 0);
      // console.log(`withoutAnyRoles => ${JSON.stringify(users)}`)
      return fluidBuilder;
    },
    withBankName: (bankName) => {
      users = users.filter((user) => user.bank && user.bank.name === bankName);
      // console.log(`withBankName ${bankName} => ${JSON.stringify(users)}`)
      return fluidBuilder;
    },
    superuser: () => {
      users = users.filter((user) => user.bank && user.bank.id === '*');
      // console.log(`superuser => ${JSON.stringify(users)}`)
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

    const currentUsersResponse = await get('/v1/users');
    const existingUsers = currentUsersResponse.body.users;

    for (const existingUser of existingUsers) {
      await remove(`/v1/users/${existingUser._id}`);
    }

    for (const testUser of testUsers) {
      await post(testUser).to('/v1/users/');

      const { body } = await post({ username: testUser.username, password: testUser.password }).to('/v1/login');
      const { token } = body;

      loadedUsers.push({
        ...testUser,
        _id: body.user._id,
        token,
      });
    }

    notYetInitialised = false;
  }

  return finder;
};
