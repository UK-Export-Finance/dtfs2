const MOCK_PORTAL_USERS = [
  {
    'user-status': 'active',
    timezone: 'Europe/London',
    username: 'BANK1_MAKER1',
    firstname: 'Tamil',
    surname: 'Rahani',
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
