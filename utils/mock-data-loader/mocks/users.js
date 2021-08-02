const BANKS = require('./banks');

const UKEF_TEST_BANK_1 = BANKS.find((bank) => bank.name === 'UKEF test bank (Delegated)');
const UKEF_TEST_BANK_2 = BANKS.find((bank) => bank.name === 'UKEF test bank (Delegated) 2');

const USERS = [
  {
    username: 'BANK1_MAKER1',
    password: 'AbC!2345',
    firstname: 'Tamil',
    surname: 'Rahani',
    email: 'maker1@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    roles: ['maker'],
    bank: UKEF_TEST_BANK_1,
  },
  {
    username: 'BANK1_CHECKER1',
    password: 'AbC!2345',
    firstname: 'Nikolaevich',
    surname: 'Chernov',
    email: 'checker@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    roles: ['checker'],
    bank: UKEF_TEST_BANK_1,
  },
  {
    username: 'BANK1_MAKENCHECK1',
    password: 'AbC!2345',
    firstname: 'Vladimir',
    surname: 'Scorpius',
    email: 'maker2@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    roles: ['maker', 'checker'],
    bank: UKEF_TEST_BANK_1,
  },
  {
    username: 'BANK1_MAKENCHECK2',
    password: 'AbC!2345',
    firstname: 'Vladimir',
    surname: 'Scorpius',
    email: 'checker2@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    roles: ['maker', 'checker'],
    bank: UKEF_TEST_BANK_1,
  },
  {
    username: 'BANK2_MAKER1',
    password: 'AbC!2345',
    firstname: 'Tamil',
    surname: 'Rahani',
    email: 'maker1@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    roles: ['maker'],
    bank: UKEF_TEST_BANK_2,
  },
  {
    username: 'BANK2_CHECKER1',
    password: 'AbC!2345',
    firstname: 'Nikolaevich',
    surname: 'Chernov',
    email: 'checker@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    roles: ['checker'],
    bank: UKEF_TEST_BANK_2,
  },
  {
    username: 'NOBODY',
    password: 'AbC!2345',
    firstname: 'Seraffimo',
    surname: 'Spang',
    email: '',
    timezone: 'Europe/London',
    roles: [],
  },
  {
    username: 'ADMIN',
    password: 'AbC!2345',
    firstname: 'Julius',
    surname: 'No',
    email: '',
    timezone: 'Europe/London',
    roles: ['maker', 'editor', 'admin'],
    bank: {
      id: '*',
    },
  },
  {
    username: 'UKEF_OPERATIONS',
    password: 'AbC!2345',
    firstname: 'Elliot',
    surname: 'Carver',
    email: '',
    timezone: 'Europe/London',
    roles: ['ukef_operations'],
    bank: {
      id: '*',
    },
  },
  {
    username: 'EDITOR',
    password: 'AbC!2345',
    firstname: 'Domingo',
    surname: 'Espada',
    email: '',
    timezone: 'Europe/London',
    roles: ['editor'],
    bank: {
      id: '*',
    },
  },
];

module.exports = USERS;
