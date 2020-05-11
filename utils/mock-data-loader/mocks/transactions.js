const TRANSACTIONS = [
  {
    bankFacilityId: '123456',
    ukefFacilityId: '20012345',
    type: 'Bond',
    value: 'USD 12,345,678.00',
    stage: 'Unissued',
    issuedDate: '',
    issuedBy: 'Mr. A.',
    created: '2020/04/25 13:45',
    maker: 'MAKERDURGA',
    checker: 'CHECKER DURGA',
    deal: {
      details: {
        bankSupplyContractID: 'MIA/Msstar/BSS/DGR',
        status: 'Acknowledged by UKEF',
        maker: {
          username: 'MAKERDURGA',
        },
        checker: {
          username: 'CHECKER DURGA',
        },
        bank: {
          name: 'Barclays',
        },
      },
      submissionDetails: {
        "supplier-name": 'TEST'
      }
    }
  },
  {
    bankFacilityId: '012345',
    ukefFacilityId: '20021234',
    type: 'Loan',
    value: 'GBP 12,345,678.00',
    stage: 'Conditional',
    issuedDate: '',
    issuedBy: 'Mr. B.',
    created: '2020/03/22 12:41',
    maker: 'MAKERDURGA',
    checker: 'CHECKER DURGA',
    deal: {
      details: {
        bankSupplyContractID: 'MIA/Msstar/BSS/DGR',
        status: 'Acknowledged by UKEF',
        maker: {
          username: 'MAKERDURGA',
        },
        checker: {
          username: 'CHECKER DURGA',
        },
        bank: {
          name: 'Barclays',
        },
      },
      submissionDetails: {
        "supplier-name": 'TEST'
      }
    }
  },
  {
    bankFacilityId: '789101',
    ukefFacilityId: '20031234',
    type: 'Bond',
    value: 'USD 123,000,000.00',
    stage: 'Issued',
    issuedDate: '',
    issuedBy: 'Mr. C.',
    created: '2020/02/11 06:12',
    maker: 'MAKERDURGA',
    checker: 'CHECKER DURGA',
    deal: {
      details: {
        bankSupplyContractID: 'MIA/Msstar/BSS/DGR',
        status: 'Acknowledged by UKEF',
        maker: {
          username: 'MAKERDURGA',
        },
        checker: {
          username: 'CHECKER DURGA',
        },
        bank: {
          name: 'HSBC',
        },
      },
      submissionDetails: {
        "supplier-name": 'TEST'
      }
    }
  }
];

module.exports = TRANSACTIONS;
