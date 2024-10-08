const Chance = require('chance');
const { MAKER, CHECKER } = require('../../constants/roles');

const chance = new Chance();

const MOCK_MAKER = {
  _id: '61cdde40055cf301acf98064',
  username: 'maker1@ukexportfinance.gov.uk',
  roles: [MAKER],
  bank: {
    id: '9',
    name: 'UKEF test bank (Delegated)',
    mga: ['mga_ukef_1.docx', 'mga_ukef_2.docx'],
    emails: ['maker1@ukexportfinance.gov.uk', 'checker1@ukexportfinance.gov.uk'],
    companiesHouseNo: 'UKEF0001',
    partyUrn: '00318345',
  },
  lastLogin: '1640950583636',
  firstname: chance.first(),
  surname: chance.last(),
  email: 'maker1@ukexportfinance.gov.uk',
  timezone: 'Europe/London',
  'user-status': 'active',
};

const MOCK_CHECKER = {
  _id: '61cdde40055cf301acf98065',
  username: 'checker1@ukexportfinance.gov.uk',
  roles: [CHECKER],
  bank: {
    id: '9',
    name: 'UKEF test bank (Delegated)',
    mga: ['mga_ukef_1.docx', 'mga_ukef_2.docx'],
    emails: ['maker1@ukexportfinance.gov.uk', 'checker1@ukexportfinance.gov.uk'],
    companiesHouseNo: 'UKEF0001',
    partyUrn: '00318345',
  },
  lastLogin: '1640950583636',
  firstname: chance.first(),
  surname: chance.last(),
  email: 'maker1@ukexportfinance.gov.uk',
  timezone: 'Europe/London',
  'user-status': 'active',
};

module.exports = {
  MOCK_MAKER,
  MOCK_CHECKER,
};
