const MOCKS = {
  CONTRACTS: [
    {
      supplyContractName: 'UKEF plc',
      id: '1',
      details: {
        bankSupplyContractID: 'MIA/Msstar/BSS/DGR',
        ukefDealId: '20010739',
        status: 'Acknowledged by UKEF',
        previousStatus: 'Submitted',
        maker: 'MAKER DURGA',
        checker: 'CHECKER DURGA',
        submissionDate: '12/02/2020',
        dateOfLastAction: '12/02/2020 - 13:45',
        submissionType: 'Automatic Inclusion Notice'
      },
      aboutSupplyContract: {
        status: 'Complete'
      },
      confirmEligibility: {
        submissionType: 'Automatic Inclusion Notice'
      },
      bondTransactions: {},
      loanTransactions: {},
      summary: {
        dealCurrency: 'USD',
        totals: {
          bonds: '100',
          loans: '200',
          transactions: '300'
        },
        dealBondsLoans: {
          totalValue: {
            dealCurrency: '1.23',
            dealInGbp: '1.23',
            bondCurrency: '1.23',
            bondInGbp: '1.23',
            loanCurrency: '1.23',
            loanInGbp: '1.23'
          },
          totalUkefExposure: {
            dealCurrency: '1.23',
            dealInGbp: '1.23',
            bondCurrency: '1.23',
            bondInGbp: '1.23',
            loanCurrency: '1.23',
            loanInGbp: '1.23'
          }
        }
      },
      comments: [
        {
          firstName: 'Durga',
          lastName: 'Rao',
          created: '12/02/2020 - 13:00',
          body: 'Test comment'
        },
        {
          firstName: 'Joe',
          lastName: 'Bloggs',
          created: '13/02/2020 - 10:00',
          body: '<a href="https://staging.ukexportfinance.gov.uk">https://staging.ukexportfinance.gov.uk</a>'
        }
      ]
    },
    {
      supplyContractName: 'CT-TestPrep-170220',
      id: '2',
      details: {
        bankSupplyContractID: 'AIN MIA/Msstar/BSS/DGR ',
        ukefDealId: '20010740',
        status: 'Acknowledged by UKEF',
        previousStatus: 'Submitted',
        maker: 'Durga Rao',
        checker: 'CHECKER DURGA',
        submissionDate: '14/01/2020',
        dateOfLastAction: '14/02/2020 - 19:15',
        submissionType: 'Automatic Inclusion Notice'
      },
      aboutSupplyContract: {
        status: 'Incomplete'
      },
      confirmEligibility: {
        status: 'Complete',
        submissionType: 'Manual Inclusion Notice'
      },
      bondTransactions: {
        items: [
          {
            bankReferenceNumber: 'Not entered',
            ukefFacilityID: '12345678',
            value: 'GBP 123,456.00',
            stage: 'Unconditional',
            startDate: '12/02/2020',
            endDate: '14/03/2027',
            action: '?'
          },
          {
            bankReferenceNumber: 'test',
            ukefFacilityID: '12345678',
            value: 'GBP 123,456.00',
            stage: 'Unconditional',
            startDate: '12/02/2020',
            endDate: '14/03/2027',
            action: '?'
          }
        ]
      },
      loanTransactions: {
        items: [
          {
            bankReferenceNumber: 'Not entered',
            ukefFacilityID: '12345678',
            status: 'Not started',
            value: 'GBP 123,456.00',
            stage: 'Unconditional',
            startDate: '12/02/2020',
            endDate: '14/03/2027',
            action: '?'
          },
          {
            bankReferenceNumber: 'test',
            ukefFacilityID: '12345678',
            status: 'Incomplete',
            value: 'GBP 123,456.00',
            stage: '',
            startDate: '',
            endDate: '',
            action: '?'
          }
        ]
      },
      summary: {
        dealCurrency: 'GBP',
        totals: {
          bonds: '1',
          loans: '0',
          transactions: '3'
        },
        dealBondsLoans: {
          totalValue: {
            dealCurrency: '1.23',
            dealInGbp: '1.23',
            bondCurrency: '1.23',
            bondInGbp: '1.23',
            loanCurrency: '0.00',
            loanInGbp: '0.00'
          },
          totalUkefExposure: {
            dealCurrency: '1.23',
            dealInGbp: '1.23',
            bondCurrency: '1.23',
            bondInGbp: '1.23',
            loanCurrency: '0.00',
            loanInGbp: '0.00'
          }
        }
      },
      comments: [
        {
          firstName: 'Durga',
          lastName: 'Rao',
          created: '15/02/2020 - 12:30',
          body: 'Testing'
        },
        {
          firstName: 'Joe',
          lastName: 'Bloggs',
          created: '16/02/2020 - 09:43',
          body: 'Please see: <a href="https://staging.ukexportfinance.gov.uk">https://staging.ukexportfinance.gov.uk</a>'
        }
      ]
    }
  ],
  TRANSACTIONS: [
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
  ]
};

module.exports = MOCKS;
