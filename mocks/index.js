
const BANKS = [
  {
    id: '956',
    name: 'Barclays Bank'
  },
  {
    id: '961',
    name: 'HSBC'
  },
  {
    id: '964',
    name: 'LLOYDS'
  },
  {
    id: '1004',
    name: 'RBS'
  },
  {
    id: '953',
    name: 'Santander'
  },
  {
    id: '9',
    name: 'UKEF test bank (Delegated)'
  }
];

const MANDATORY_CRITERIA = [
  {
    title: 'Supply contract/Transaction',
    items: [
      {
        id: 1,
        copy: 'The Supplier has provided the Bank with a duly completed Supplier Declaration, and the Bank is not aware that any of the information contained within it is inaccurate.'
      },
      {
        id: 2,
        copy: 'The Bank has complied with its policies and procedures in relation to the Transaction.'
      },
      {
        id: 3,
        copy: 'Where the Supplier is a UK Supplier, the Supplier has provided the Bank with a duly completed UK Supplier Declaration, and the Bank is not aware that any of the information contained within it is inaccurate. (Conditional for UK Supplier)'
      }
    ]
  },
  {
    title: 'Financial',
    items: [
      {
        id: 4,
        copy: 'The Bank Customer (to include both the Supplier and any Parent Obligor) is an <a class="govuk-link" href="#">Eligible Person.</a>'
      }
    ]
  },
  {
    title: 'Credit',
    items: [
      {
        id: 5,
        copy: 'The Bank Customer (to include both the Supplier and any UK Parent Obligor) has a one- year probability of default of less than 14.1%.'
      }
    ]
  },
  {
    title: 'Bank Facility Letter',
    items: [
      {
        id: 6,
        copy: 'The Bank Facility Letter is governed by the laws of England and Wales, Scotland or Northern Ireland.'
      }
    ]
  },
  {
    title: 'Legal',
    items: [
      {
        id: 7,
        copy: 'The Bank is the sole and beneficial owner of, and has legal title to, the Transaction.'
      },
      {
        id: 8,
      copy: 'The Bank has not made a Disposal (other than a Permitted Disposal) or a Risk Transfer (other than a Permitted Risk Transfer) in relation to the Transaction.'
      },
      {
        id: 9,
        copy: 'The Bank’s right, title and interest in relation to the Transaction is clear of any Security and Quasi-Security (other than Permitted Security) and is freely assignable without the need to obtain consent of any Obligor or any other person.'
      },
      {
        id: 10,
        copy: 'The Bank is not restricted or prevented by any agreement with an Obligor from providing information and records relating to the Transaction.'
      }
    ]
  }
];

const ELIGIBILITY_CRITERIA = [
  {
    id: 11,
    description: 'The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve agents and the Bank is not aware that any of the information contained within it is inaccurate.'
  },
  {
    id: 12,
    description: 'The cover period for each Transaction does not exceed 5 years, or such other period approved by UKEF (that has not lapsed or been withdrawn) in relation to bonds and/or loans for this Obligor.'
  },
  {
    id: 13,
    description: 'The total UKEF exposure, across all short-term schemes (including bond support and export working capital transactions), for this Obligor (including this Transaction) does not exceed £2 million, or such other limit approved by UKEF (that has not lapsed or been withdrawn).'
  },
  {
    id: 14,
    description: 'For a bond Transaction, the bond has not yet been issued or, where the bond has been issued, this was done no more than 3 months prior to the submission of this Inclusion Notice. For a loan Transaction, the loan has not yet been advanced.'
  },
  {
    id: 15,
    description: 'The Requested Cover Start Date is no more than three months from the date of submission.'
  },
  {
    id: 16,
    description: 'The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve any of the following Controlled Sectors: sharp arms defence, nuclear, radiological, biological, human cloning, pornography, tobacco or gambling, and the Bank is not aware that any of the information contained within it is inaccurate.'
  },
  {
    id: 17,
    description: 'The Bank has completed its Bank Due Diligence to its satisfaction in accordance with its policies and procedures without having to escalate to any Relevant Person.'
  },
  {
    id: 18,
    description: 'The fees and/or interest apply to the whole Cover Period, and have been set in accordance with the Bank’s normal pricing policies and, if any, minimum or overall pricing requirements set by UKEF.'
  }
];

const SUPPORTING_DOCUMENTATION = [
  {
    fieldName: 'manualInclusionQuestionnaire',
    title: 'Manual Inclusion Questionnaire',
    description: 'Please upload a completed Manual Inclusion Questionnaire. You can download the template here: <a href="#" class="govuk-link">Manual Inclusion Questionnaire</a>',
    inputType: 'file'
  },
  {
    fieldName: 'financialStatements',
    title: 'Financial statements for the past 3 years',
    description: 'Financial statements (audited if available) for the past 3 years, including a Profit & Loss, Balance Sheet and Cash Flow Statement, (with notes, if applicable). If the company is part of a larger group, separate accounts should be provided for the company and group.',
    inputType: 'file'
  },
  {
    fieldName: 'managementAccounts',
    title: 'Year to date management accounts',
    description: 'Including Profit & Loss, Balance Sheet and Cash Flow where available.',
    inputType: 'file'
  },
  {
    fieldName: 'financialForecasts',
    title: 'Financial forecasts for the next 3 years',
    description: 'Including monthly cash-flow projections for the business as a whole. If unavailable provide for at least the projected facility/guarantee term. If there are any cash flow shortfalls, explain how these will be filled.',
    inputType: 'file'
  },
  {
    fieldName: 'financialInformation',
    title: 'Brief commentary on the financial information',
    description: 'A brief commentary on the financial information in 2-4, with particular focus on turnover, gross and net profit, dividends (if any), debt profile including bank borrowing and net worth, and any other information with explains any exceptions, anomalies or volatility. If the company has experienced any unusual or off-trend financial performance in the last 3 years please also explain this.',
    inputType: 'file'
  },
  {
    fieldName: 'corporateStructureDiagram',
    title: 'Corporate structure diagram',
    description: 'Showing corporate structure including parent, subsidiary and associated companies.',
    inputType: 'file'
  },
  {
    fieldName: 'security',
    title: 'Security',
    description: 'Details of the overarching general facility taken by the bank in relation to the exporter, for example debenture, fixed and floating charge, but not including any security that is specific to the Transaction.',
    inputType: 'textarea'
  }
];

const MOCKS = {
  BANKS,
  MANDATORY_CRITERIA,
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
      eligibility: {
        status: 'Incomplete',
        submissionType: 'Automatic Inclusion Notice',
        criteria: ELIGIBILITY_CRITERIA,
        completedStatus: {
          eligibilityCriteria: true,
          supportingDocumentation: false
        }
      },
      bondTransactions: {
        items: [
          {
            id: 1,
            bankReferenceNumber: 'Not entered',
            ukefFacilityID: '12345678',
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
            id: 2,
            bankReferenceNumber: 'test',
            ukefFacilityID: '12345678',
            value: 'GBP 123,456.00',
            stage: 'Unconditional',
            startDate: '12/02/2020',
            endDate: '14/03/2027',
            action: '?',
            completedStatus: {
              bondDetails: true,
              bondFinancialDetails: true,
              feeDetails: true
            }
          }
        ]
      },
      loanTransactions: {
        items: [
          {
            id: 1,
            bankReferenceNumber: 'Not entered',
            ukefFacilityID: '12345678',
            status: 'Not started',
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
            id: 2,
            bankReferenceNumber: 'test',
            ukefFacilityID: '12345678',
            status: 'Incomplete',
            value: 'GBP 123,456.00',
            stage: '',
            startDate: '',
            endDate: '',
            action: '?',
            completedStatus: {
              bondDetails: true,
              bondFinancialDetails: true,
              feeDetails: true
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
      ],
      submissionDetails: {
        supplierType: 'Exporter',
        supplierCompaniesHouseRegistrationNumber: '1234',
        supplierName: 'TEST',
        supplierAddress: 'Test <br/> PO1 3AX <br/>GBR',
        suppliersCorrespondenceAddressDifferent: false,
        industrySector: '1234',
        industryClass: '56789',
        smeType: 'Mico',
        supplyContractDescription: 'Test',
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
            transactionCurrencySameAsSupplyContractCurrency: true,
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
      eligibility: {
        status: 'Complete',
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
            id: 1,
            bankReferenceNumber: 'Not entered',
            ukefFacilityID: '12345678',
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
            id: 2,
            bankReferenceNumber: 'test',
            ukefFacilityID: '12345678',
            value: 'GBP 123,456.00',
            stage: 'Unconditional',
            startDate: '12/02/2020',
            endDate: '14/03/2027',
            action: '?',
            completedStatus: {
              bondDetails: true,
              bondFinancialDetails: true,
              feeDetails: true
            }
          }
        ]
      },
      loanTransactions: {
        items: [
          {
            id: 1,
            bankReferenceNumber: 'Not entered',
            ukefFacilityID: '12345678',
            status: 'Not started',
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
            id: 2,
            bankReferenceNumber: 'test',
            ukefFacilityID: '12345678',
            status: 'Incomplete',
            value: 'GBP 123,456.00',
            stage: '',
            startDate: '',
            endDate: '',
            action: '?',
            completedStatus: {
              bondDetails: true,
              bondFinancialDetails: true,
              feeDetails: true
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
      ],
      submissionDetails: {
        supplierType: 'Exporter',
        supplierCompaniesHouseRegistrationNumber: '123',
        supplierName: 'TEST',
        supplierAddress: 'Test <br/> PO1 3AX <br/>GBR',
        suppliersCorrespondenceAddressDifferent: false,
        industrySector: '5678',
        industryClass: '12345',
        smeType: 'Mico',
        supplyContractDescription: 'Test',
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
            transactionCurrencySameAsSupplyContractCurrency: true,
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
    },
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
