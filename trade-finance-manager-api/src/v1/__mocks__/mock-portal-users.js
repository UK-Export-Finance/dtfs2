const MOCK_PORTAL_USERS = [
  {
    _id: 'abcdef123456789012345678',
    'user-status': 'active',
    timezone: 'Europe/London',
    username: 'maker1@ukexportfinance.gov.uk',
    firstname: 'First',
    surname: 'Last',
    email: 'maker1@ukexportfinance.gov.uk',
    roles: ['maker'],
    bank: {
      id: '9',
      name: 'UKEF test bank (Delegated)',
      mga: ['mga_ukef_1.docx', 'mga_ukef_2.docx'],
      emails: ['maker1@ukexportfinance.gov.uk', 'checker1@ukexportfinance.gov.uk'],
    },
  },
];

module.exports = { MOCK_PORTAL_USERS };
