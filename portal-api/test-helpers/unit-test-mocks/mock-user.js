const { produce } = require('immer');
const { STATUS } = require('../../server/constants/user');
const { MAKER } = require('../../server/v1/roles/roles');

const BASE_TEST_USER = {
  _id: '075bcd157dcb851180e02a7c',
  username: 'maker-1',
  firstname: 'Mister',
  surname: 'One',
  email: 'one@ukexportfinance.gov.uk',
  timezone: 'Europe/London',
  roles: [MAKER],
  bank: {
    id: '961',
    name: 'Bank 2',
    emails: ['maker1@ukexportfinance.gov.uk', 'maker2@ukexportfinance.gov.uk'],
  },
  isTrusted: false,
  signInLinkSendDate: 1700000000000,
  signInLinkSendCount: 1,
};

const TEST_USER = produce(BASE_TEST_USER, (draft) => {
  draft.password = 'P@ssword1234';
});

const TEST_USER_PARTIAL_2FA = produce(BASE_TEST_USER, (draft) => {
  draft['user-status'] = STATUS.ACTIVE;
});

const TEST_DATABASE_USER = produce(BASE_TEST_USER, (draft) => {
  draft['user-status'] = STATUS.ACTIVE;
  draft.salt = '01';
  draft.hash = '02';
  draft.signInTokens = [
    { saltHex: '03', hashHex: '04', expiry: 1700000000000 },
    { saltHex: '05', hashHex: '06', expiry: 1700501222290 },
  ];
});

const TEST_USER_TRANSFORMED_FROM_DATABASE = produce(BASE_TEST_USER, (draft) => {
  draft['user-status'] = STATUS.ACTIVE;
  draft.salt = '01';
  draft.hash = '02';
  draft.signInTokens = [
    { salt: Buffer.from('03', 'hex'), hash: Buffer.from('04', 'hex'), expiry: 1700000000000 },
    { salt: Buffer.from('05', 'hex'), hash: Buffer.from('06', 'hex'), expiry: 1700501222290 },
  ];
});

const TEST_USER_SANITISED_FOR_FRONTEND = produce(BASE_TEST_USER, (draft) => {
  draft.disabled = undefined;
  draft.lastLogin = undefined;
  draft['user-status'] = STATUS.ACTIVE;
});

module.exports = {
  TEST_USER,
  TEST_USER_PARTIAL_2FA,
  TEST_DATABASE_USER,
  TEST_USER_TRANSFORMED_FROM_DATABASE,
  TEST_USER_SANITISED_FOR_FRONTEND,
};
