const Chance = require('chance');

const chance = new Chance();

const MOCK_REQUEST = {
  username: 'BANK1_MAKER1',
  firstname: chance.first(),
  surname: chance.last(),
  email: chance.email(),
  roles: ['maker'],
  bank: {
    id: '9',
    name: 'UKEF test bank (Delegated)',
    mga: ['mga_ukef_1.docx', 'mga_ukef_2.docx'],
    emails: [
      'maker1@ukexportfinance.gov.uk',
      'checker1@ukexportfinance.gov.uk',
    ],
    companiesHouseNo: 'UKEF0001',
    partyUrn: '00318345',
  },
  timezone: 'Europe/London',
  lastLogin: '1638791497263',
  'user-status': 'active',
  _id: '619bae3467cc7c002069fc1e',
};

const MOCK_REQUEST_CHECKER = {
  username: 'BANK1_CHECKER1',
  firstname: chance.first(),
  surname: chance.last(),
  email: chance.email(),
  roles: ['checker'],
  bank: {
    id: '9',
    name: 'UKEF test bank (Delegated)',
    mga: ['mga_ukef_1.docx', 'mga_ukef_2.docx'],
    emails: [
      'maker1@ukexportfinance.gov.uk',
      'checker1@ukexportfinance.gov.uk',
    ],
    companiesHouseNo: 'UKEF0001',
    partyUrn: '00318345',
  },
  timezone: 'Europe/London',
  lastLogin: '1638791497263',
  'user-status': 'active',
  _id: '619bae3467cc7c002069fc1e',
};

module.exports = {
  MOCK_REQUEST,
  MOCK_REQUEST_CHECKER,
};
