const MOCK_BANKS = {
  BARCLAYS: {
    id: '956',
    name: 'Barclays Bank',
    mga: ['Test.pdf'],
    emails: ['maker4@ukexportfinance.gov.uk', 'checker4@ukexportfinance.gov.uk'],
    companiesHouseNo: '01026167',
    partyUrn: '00300130',
    hasGefAccessOnly: false,
    paymentOfficerTeam: {
      teamName: 'Barclays Payment Reporting Team',
      email: 'payment-officer4@ukexportfinance.gov.uk',
    },
  },
  HSBC: {
    id: '961',
    name: 'HSBC',
    mga: ['Test.pdf'],
    emails: ['checker4@ukexportfinance.gov.uk'],
    companiesHouseNo: '00014259',
    partyUrn: '00300342',
    hasGefAccessOnly: false,
    paymentOfficerTeam: {
      teamName: 'HSBC Payment Reporting Team',
      email: 'payment-officer4@ukexportfinance.gov.uk',
    },
  },
};

module.exports = MOCK_BANKS;
