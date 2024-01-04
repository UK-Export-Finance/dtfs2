const { STATUS } = require('../../src/constants/user');
const { MAKER } = require('../../src/v1/roles/roles');

const TEST_USER = {
  _id: '075bcd157dcb851180e02a7c',
  username: 'HSBC-maker-1',
  password: 'P@ssword1234',
  firstname: 'Mister',
  surname: 'One',
  email: 'one@email.com',
  timezone: 'Europe/London',
  roles: [MAKER],
  bank: {
    id: '961',
    name: 'HSBC',
    emails: ['maker1@ukexportfinance.gov.uk', 'maker2@ukexportfinance.gov.uk'],
  },
  signInToken: { salt: Buffer.from('03', 'hex'), hash: Buffer.from('04', 'hex') },
};

const TEST_DATABASE_USER = {
  _id: '075bcd157dcb851180e02a7c',
  'user-status': STATUS.ACTIVE,
  timezone: 'Europe/London',
  username: 'HSBC-maker-1',
  firstname: 'Mister',
  surname: 'One',
  email: 'one@email.com',
  roles: [MAKER],
  bank: {
    id: '961',
    name: 'HSBC',
    emails: ['maker1@ukexportfinance.gov.uk', 'maker2@ukexportfinance.gov.uk'],
  },
  salt: '01',
  hash: '02',
  signInToken: { saltHex: '03', hashHex: '04', expiry: 1700501222290 },
};

const TEST_USER_SANITISED = {
  _id: '075bcd157dcb851180e02a7c',
  bank: {
    emails: ['maker1@ukexportfinance.gov.uk', 'maker2@ukexportfinance.gov.uk'],
    id: '961',
    name: 'HSBC',
  },
  disabled: undefined,
  email: 'one@email.com',
  firstname: 'Mister',
  lastLogin: undefined,
  roles: ['maker'],
  surname: 'One',
  timezone: 'Europe/London',
  'user-status': undefined,
  username: 'HSBC-maker-1',
};

module.exports = { TEST_USER, TEST_DATABASE_USER, TEST_USER_SANITISED };
