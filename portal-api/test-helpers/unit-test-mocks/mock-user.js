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

module.exports = { TEST_USER };
