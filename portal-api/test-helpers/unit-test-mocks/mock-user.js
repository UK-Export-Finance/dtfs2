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
};

const TEST_DATABASE_USER = {
  _id: {
    $oid: '075bcd157dcb851180e02a7c',
  },
  'user-status': 'active',
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
  signInToken: { saltHex: '03', hashHex: '04' },
};
module.exports = { TEST_USER, TEST_DATABASE_USER };
