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
        supportingDocumentation: {
          manualInclusionQuestionnaire: 'test.pdf',
          financialStatements: '',
          managementAccounts: 'mock.docx',
          financialForecasts: '',
          financialInformation: 'test.pdf',
          corporateStructure: '',
          security: ''
        },
        eligibilityCriteria: [
          {
            heading: 'Eligibility criterion 11',
            description: 'The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve agents and the Bank is not aware that any of the information contained within it is inaccurate.',
            answer: true
          },
          {
            heading: 'Eligibility criterion 12',
            description: 'The cover period for each Transaction does not exceed 5 years, or such other period approved by UKEF (that has not lapsed or been withdrawn) in relation to bonds and/or loans for this Obligor.',
            answer: false
          },
          {
            heading: 'Eligibility criterion 13',
            description: 'The total UKEF exposure, across all short-term schemes (including bond support and export working capital transactions), for this Obligor (including this Transaction) does not exceed £2 million, or such other limit approved by UKEF (that has not lapsed or been withdrawn).',
            answer: true
          },
          {
            heading: 'Eligibility criterion 14',
            description: 'For a bond Transaction, the bond has not yet been issued or, where the bond has been issued, this was done no more than 3 months prior to the submission of this Inclusion Notice. For a loan Transaction, the loan has not yet been advance.',
            answer: true
          },
          {
            heading: 'Eligibility criterion 15',
            description: 'The Requested Cover Start Date is no more than three months from the date of submission.',
            answer: true
          },
          {
            heading: 'Eligibility criterion 16',
            description: 'The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve any of the following Controlled Sectors: sharp arms defence, nuclear, radiological, biological, human cloning, pornography, tobacco or gambling, and the Bank is not aware that any of the information contained within it is inaccurate.',
            answer: true
          },
          {
            heading: 'Eligibility criterion 17',
            description: 'The Bank has completed its Bank Due Diligence to its satisfaction in accordance with its policies and procedures without having to escalate to any Relevant Person.',
            answer: true
          },
          {
            heading: 'Eligibility criterion 18',
            description: 'The fees and/or interest apply to the whole Cover Period, and have been set in accordance with the Bank’s normal pricing policies and, if any, minimum or overall pricing requirements set by UKEF.',
            answer: true
          }
        ]
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
