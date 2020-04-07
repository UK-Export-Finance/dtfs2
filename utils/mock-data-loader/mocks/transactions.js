const TRANSACTIONS = [
  {
    bankFacilityId: '123456',
    ukefFacilityId: '20012345',
    type: 'Bond',
    value: 'USD 12,345,678.00',
    stage: 'Unissued',
    issuedDate: '',
    maker: 'MAKERDURGA',
    checker: 'CHECKER DURGA'
  },
  {
    bankFacilityId: '012345',
    ukefFacilityId: '20021234',
    type: 'Loan',
    value: 'GBP 12,345,678.00',
    stage: 'Conditional',
    issuedDate: '',
    maker: 'MAKERDURGA',
    checker: 'CHECKER DURGA'
  },
  {
    bankFacilityId: '789101',
    ukefFacilityId: '20031234',
    type: 'Bond',
    value: 'USD 123,000,000.00',
    stage: 'Issued',
    issuedDate: '',
    maker: 'MAKERDURGA',
    checker: 'CHECKER DURGA'
  }
];

module.exports = TRANSACTIONS;
