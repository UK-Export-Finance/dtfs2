const CONTRACT = {
  supplyContractName: 'UKEF plc',
  id: '1234',
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
      created: '12/03/2020 - 10:00',
      body: '<a href="https://staging.ukexportfinance.gov.uk">https://staging.ukexportfinance.gov.uk</a>'
    }
  ]
};

const MOCKS = {
  CONTRACT
};


module.exports = MOCKS;
