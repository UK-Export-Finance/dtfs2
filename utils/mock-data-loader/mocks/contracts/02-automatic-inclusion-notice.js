const ELIGIBILITY_CRITERIA = require('../eligibilityCriteria');
const SUPPORTING_DOCUMENTATION = require('../supportingDocumentation');

module.exports = {
  bankSupplyContractName: 'CT-TestPrep-170220',
  details: {
    bank: 'UKEF test bank',
    bankSupplyContractID: 'AIN MIA/Msstar/BSS/DGR ',
    bankSupplyContractName: 'AIN deal',
    ukefDealId: '20010740',
    status: 'Acknowledged by UKEF',
    previousStatus: 'Submitted',
    checker: 'CHECKER DURGA',
    submissionType: 'Automatic Inclusion Notice'
  },
  aboutSupplyContract: {
    status: 'Incomplete'
  },
  eligibility: {
    status: 'Completed',
    submissionType: 'Manual Inclusion Notice',
    criteria: ELIGIBILITY_CRITERIA,
    completedStatus: {
      eligibilityCriteria: true,
      supportingDocumentation: true
    }
  },
  bondTransactions: {
    items: [
      {
        id: '1',
        uniqueIdentificationNumber: 'unique5',
        ukefFacilityID: 'e12345678',
        value: 'GBP 123,456.00',
        bondStage: 'Issued',
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
        uniqueIdentificationNumber: 'unique6',
        ukefFacilityID: 'f12345678',
        value: 'GBP 123,456.00',
        bondStage: 'Issued',
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
        bankReferenceNumber: 'unique7',
        ukefFacilityID: 'g12345678',
        status: 'Incomplete',
        value: 'GBP 123,456.00',
        facilityStage: 'Unconditional',
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
        bankReferenceNumber: 'unique8',
        ukefFacilityID: 'h12345678',
        status: 'Incomplete',
        value: 'GBP 123,456.00',
        facilityStage: 'Unconditional',
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
  submissionDetails: {
    "supplier-type": 'Exporter',
    supplierCompaniesHouseRegistrationNumber: '123',
    "supplier-name": 'TEST',
    supplierAddress: 'Test <br/> PO1 3AX <br/>GBR',
    "supplier-correspondence-address-is-different": false,
    "industry-sector": '5678',
    "industry-class": '12345',
    "sme-type": 'Micro',
    "supply-contract-description": 'Test',
    legallyDistinct: false,
    buyer: {
      name: 'TESTING',
      country: 'United Kingdom',
      goodsServicesDestination: 'France'
    },
    supplyContractFinancials: {
      value: '456.00',
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
        value: '1.50',
        currencySameAsSupplyContractCurrency: true,
        riskMarginFee: '1%',
        coveredPercentage: '70%',
        minimumRiskMarginFee: '0.00',
        guaranteeFeePayableByBank: '2.4500%',
        uKefExposure: '0.25'
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
        href: d.id === 7 ? null : 'test.docx',
        value: d.id === 7 ? 'Test' : null
      }
    }),
    eligibilityCriteria: ELIGIBILITY_CRITERIA.map(c => {
      return {
        ...c,
        answer: (c.id === 14 || c.id === 16) ? false : true
      }
    })
  }
}
