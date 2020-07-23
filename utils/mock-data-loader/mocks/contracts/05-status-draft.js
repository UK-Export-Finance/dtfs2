const ELIGIBILITY_CRITERIA = require('../eligibilityCriteria');
const SUPPORTING_DOCUMENTATION = require('../supportingDocumentation');

module.exports = {
  bankSupplyContractName: 'UKEF plc',
  details: {
    bank: 'UKEF test bank',
    bankSupplyContractID: 'MIA/Msstar/BSS/DGR/3',
    bankSupplyContractName: 'MIA deal - Manual Inclusion Application',
    ukefDealId: '20010739',
    status: 'Draft',
    previousStatus: 'Submitted',
    checker: 'CHECKER DURGA',
    submissionType: 'Manual Inclusion Application'
  },
  aboutSupplyContract: {
    status: 'Completed'
  },
  eligibility: {
    status: 'Incomplete',
    submissionType: 'Manual Inclusion Application',
    criteria: ELIGIBILITY_CRITERIA,
    completedStatus: {
      eligibilityCriteria: true,
      supportingDocumentation: false
    }
  },
  bondTransactions: {
    items: [
      {
        id: '1',
        uniqueIdentificationNumber: 'Not entered',
        value: 'GBP 123,456.00',
        stage: 'Unconditional',
        startDate: '12/02/2020',
        endDate: '14/03/2027',
        action: '?',
        completedStatus: {
          bondDetails: false,
          bondFinancialDetails: false,
          feeDetails: false
        }
      },
      {
        id: '2',
        uniqueIdentificationNumber: 'test',
        value: 'GBP 123,456.00',
        stage: 'Unconditional',
        startDate: '12/02/2020',
        endDate: '14/03/2027',
        action: '?',
        completedStatus: {
          bondDetails: false,
          bondFinancialDetails: false,
          feeDetails: false
        }
      }
    ]
  },
  loanTransactions: {
    items: [
      {
        id: '1',
        bankReferenceNumber: 'Not entered',
        status: 'Incomplete',
        value: 'GBP 123,456.00',
        stage: 'Unconditional',
        startDate: '12/02/2020',
        endDate: '14/03/2027',
        action: '?',
        completedStatus: {
          bondDetails: true,
          bondFinancialDetails: false,
          feeDetails: false
        }
      },
      {
        id: '2',
        bankReferenceNumber: 'test',
        status: 'Incomplete',
        value: 'GBP 123,456.00',
        stage: '',
        startDate: '',
        endDate: '',
        action: '?',
        completedStatus: {
          bondDetails: false,
          bondFinancialDetails: false,
          feeDetails: false
        }
      }
    ]
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
  submissionDetails: {
    "supplier-type": 'Exporter',
    supplierCompaniesHouseRegistrationNumber: '1234',
    "supplier-name": 'TEST',
    supplierAddress: 'Test <br/> PO1 3AX <br/>GBR',
    "supplier-correspondence-address-is-different": false,
    "industry-sector": '1234',
    "industry-class": '56789',
    "sme-type": 'Micro',
    "supply-contract-description": 'Test',
    legallyDistinct: false,
    buyer: {
      name: 'TESTING',
      country: 'United Kingdom',
      goodsServicesDestination: 'France'
    },
    supplyContractFinancials: {
      value: '123.00',
      currency: 'USD - US Dollars',
      conversionRateToGBP: '0.8',
      conversionDate: '01/02/2020'
    },
    bond: {
      issuer: 'test',
      type: 'Advance payment guarantee',
      stage: 'Issued',
      cover: {
        requestedStartDate: '13/02/2020',
        endDate: '01/01/2023'
      },
      uniqueIdentificationNumber: 'TEST',
      beneficiary: 'TEST',
      financial: {
        value: '1.00',
        currencySameAsSupplyContractCurrency: true,
        riskMarginFee: '3%',
        coveredPercentage: '50%',
        minimumRiskMarginFee: '0.00',
        guaranteeFeePayableByBank: '2.7000%',
        uKefExposure: '0.50'
      },
      fee: {
        type: 'In advance',
        frequency: 'Quarterly',
        dayCountBasis: '365'
      }
    },
    supportingDocumentation: SUPPORTING_DOCUMENTATION.map(d => {
      return {
        ...d,
        href: d.id === 7 ? null : 'test.pdf',
        value: d.id === 7 ? 'Testing' : null
      }
    }),
    eligibilityCriteria: ELIGIBILITY_CRITERIA.map(c => {
      return {
        ...c,
        answer: (c.id === 12 || c.id === 14) ? false : true
      }
    })
  }
}
