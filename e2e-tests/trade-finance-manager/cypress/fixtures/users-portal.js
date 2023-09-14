const MOCK_MAKER_TFM = {
  username: 'BANK1_MAKER1',
  password: 'AbC!2345',
  firstname: 'First',
  surname: 'Last',
  email: 'maker1@ukexportfinance.gov.uk',
  timezone: 'Europe/London',
  roles: ['maker'],
  bank: {
    id: '9',
    name: 'UKEF test bank (Delegated) (TFM)',
    emails: [
      'checker@ukexportfinance.gov.uk',
    ],
  },
};

const ADMIN_LOGIN = {
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
};

module.exports = {
  MOCK_MAKER_TFM,
  ADMIN_LOGIN,
};
