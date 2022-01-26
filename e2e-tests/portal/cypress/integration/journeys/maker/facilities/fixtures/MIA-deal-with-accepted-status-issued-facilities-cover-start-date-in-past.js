const now = new Date().valueOf();
const nowMinusDay = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.valueOf();
};

const deal = {
  submissionType: 'Manual Inclusion Application',
  updatedAt: Date.now(),
  bankInternalRefName: 'test',
  additionalRefName: 'testing',
  status: 'Accepted by UKEF (with conditions)',
  previousStatus: "Ready for Checker's approval",
  bank: {
    id: '9',
    name: 'UKEF test bank (Delegated)',
    emails: [
      'maker@ukexportfinance.gov.uk',
      'checker@ukexportfinance.gov.uk',
    ],
  },
  maker: {
    username: 'MAKER',
    roles: [
      'maker',
    ],
    bank: {
      id: '9',
      name: 'UKEF test bank (Delegated)',
      emails: [
        'maker@ukexportfinance.gov.uk',
        'checker@ukexportfinance.gov.uk',
      ],
    },
    lastLogin: '1598276453454',
    firstname: 'Hugo',
    surname: 'Drax',
    email: 'maker@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    'user-status': 'active',
  },
  details: {
    createdDate: now,
    checker: {
      bank: {
        id: '9',
        name: 'UKEF test bank (Delegated)',
        emails: [
          'maker@ukexportfinance.gov.uk',
          'checker@ukexportfinance.gov.uk',
        ],
      },
      email: 'checker@ukexportfinance.gov.uk',
      firstname: 'Emilio',
      lastLogin: '1598276464750',
      roles: [
        'checker',
      ],
      surname: 'Largo',
      timezone: 'Europe/London',
      'user-status': 'active',
      username: 'CHECKER',
    },
    submissionDate: now,
  },
  eligibility: {
    status: 'Completed',
    criteria: [
      {
        id: 11,
        description: 'The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve agents and the Bank is not aware that any of the information contained within it is inaccurate.',
        answer: true,
      },
      {
        id: 12,
        description: 'The cover period for each Transaction does not exceed 5 years, or such other period approved by UKEF (that has not lapsed or been withdrawn) in relation to bonds and/or loans for this Obligor.',
        answer: true,
      },
      {
        id: 13,
        description: 'The total UKEF exposure, across all short-term schemes (including bond support and export working capital transactions), for this Obligor (including this Transaction) does not exceed £2 million, or such other limit approved by UKEF (that has not lapsed or been withdrawn).',
        answer: true,
      },
      {
        id: 14,
        description: 'For a bond Transaction, the bond has not yet been issued or, where the bond has been issued, this was done no more than 3 months prior to the submission of this Inclusion Notice. For a loan Transaction, the loan has not yet been advanced.',
        answer: true,
      },
      {
        id: 15,
        description: 'The Requested Cover Start Date is no more than three months from the date of submission.',
        answer: false,
      },
      {
        id: 16,
        description: 'The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve any of the following Controlled Sectors: sharp arms defence, nuclear, radiological, biological, human cloning, pornography, tobacco or gambling, and the Bank is not aware that any of the information contained within it is inaccurate.',
        answer: true,
      },
      {
        id: 17,
        description: 'The Bank has completed its Bank Due Diligence to its satisfaction in accordance with its policies and procedures without having to escalate to any Relevant Person.',
        answer: true,
      },
      {
        id: 18,
        description: 'The fees and/or interest apply to the whole Cover Period, and have been set in accordance with the Bank’s normal pricing policies and, if any, minimum or overall pricing requirements set by UKEF.',
        answer: true,
      },
    ],
  },
  submissionDetails: {
    status: 'Incomplete',
    'indemnifier-address-country': {
      code: 'GBR',
      name: 'United Kingdom',
    },
    'indemnifier-address-line-1': '',
    'indemnifier-address-line-2': '',
    'indemnifier-address-line-3': '',
    'indemnifier-address-postcode': '',
    'indemnifier-address-town': '',
    'indemnifier-companies-house-registration-number': '',
    'indemnifier-correspondence-address-country': {
      code: 'GBR',
      name: 'United Kingdom',
    },
    'indemnifier-correspondence-address-line-1': '',
    'indemnifier-correspondence-address-line-2': '',
    'indemnifier-correspondence-address-line-3': '',
    'indemnifier-correspondence-address-postcode': '',
    'indemnifier-correspondence-address-town': '',
    'indemnifier-name': '',
    'industry-class': {
      code: '56101',
      name: 'Licensed restaurants',
    },
    'industry-sector': {
      code: '1008',
      name: 'Accommodation and food service activities',
    },
    legallyDistinct: 'false',
    'sme-type': 'Micro',
    'supplier-address-country': {
      code: 'GBR',
      name: 'United Kingdom',
    },
    'supplier-address-line-1': 'test',
    'supplier-address-line-2': 'test',
    'supplier-address-line-3': 'test',
    'supplier-address-postcode': 'test',
    'supplier-address-town': 'test',
    'supplier-companies-house-registration-number': '',
    'supplier-correspondence-address-country': {
      code: 'GBR',
      name: 'United Kingdom',
    },
    'supplier-correspondence-address-is-different': 'false',
    'supplier-correspondence-address-line-1': '',
    'supplier-correspondence-address-line-2': '',
    'supplier-correspondence-address-line-3': '',
    'supplier-correspondence-address-postcode': '',
    'supplier-correspondence-address-town': '',
    'supplier-name': 'test',
    'supplier-type': 'Exporter',
    'supply-contract-description': 'test',
    'buyer-address-country': {
      code: 'GBR',
      name: 'United Kingdom',
    },
    'buyer-address-line-1': 'test',
    'buyer-address-line-2': 'test',
    'buyer-address-line-3': 'test',
    'buyer-address-postcode': 'test',
    'buyer-address-town': 'test',
    'buyer-name': 'test',
    destinationOfGoodsAndServices: {
      code: 'GBR',
      name: 'United Kingdom',
    },
    'supplyContractConversionDate-day': '',
    'supplyContractConversionDate-month': '',
    'supplyContractConversionDate-year': '',
    supplyContractConversionRateToGBP: '',
    supplyContractCurrency: {
      id: 'GBP',
      text: 'GBP - UK Sterling',
    },
    supplyContractValue: '1234.00',
  },
  mockFacilities: [
    {
      type: 'Bond',
      createdDate: now,
      bondIssuer: '',
      bondType: 'Performance bond',
      facilityStage: 'Issued',
      hasBeenIssued: true,
      ukefGuaranteeInMonths: '12',
      bondBeneficiary: '',
      guaranteeFeePayableByBank: '18.0000',
      updatedAt: Date.now(),
      value: '1234.00',
      currencySameAsSupplyContractCurrency: 'true',
      riskMarginFee: '20',
      coveredPercentage: '40',
      minimumRiskMarginFee: '',
      ukefExposure: '493.60',
      feeType: 'At maturity',
      dayCountBasis: '365',
      currency: {
        text: 'GBP - UK Sterling',
        id: 'GBP',
      },
      'issuedDate-day': '25',
      'issuedDate-month': '08',
      'issuedDate-year': '2020',
      'requestedCoverStartDate-day': '26',
      'requestedCoverStartDate-month': '08',
      'requestedCoverStartDate-year': '2020',
      'coverEndDate-day': '24',
      'coverEndDate-month': '09',
      'coverEndDate-year': '2020',
      name: '1234',
      issueFacilityDetailsStarted: true,
      nameRequiredForIssuance: true,
      requestedCoverStartDate: nowMinusDay(),
      issuedDate: now,
      issueFacilityDetailsProvided: true,
      status: 'Submitted',
      previousFacilityStage: 'Unissued',
      issueFacilityDetailsSubmitted: true,
    },
    {
      type: 'Loan',
      createdDate: now,
      facilityStage: 'Unconditional',
      hasBeenIssued: true,
      ukefGuaranteeInMonths: '12',
      name: '5678',
      guaranteeFeePayableByBank: '27.0000',
      updatedAt: Date.now(),
      value: '1234.00',
      currencySameAsSupplyContractCurrency: 'true',
      interestMarginFee: '30',
      coveredPercentage: '20',
      minimumQuarterlyFee: '',
      ukefExposure: '246.80',
      premiumType: 'At maturity',
      dayCountBasis: '365',
      'issuedDate-day': '25',
      'issuedDate-month': '08',
      'issuedDate-year': '2020',
      'coverEndDate-day': '24',
      'coverEndDate-month': '09',
      'coverEndDate-year': '2020',
      disbursementAmount: '1,234.00',
      issueFacilityDetailsStarted: true,
      nameRequiredForIssuance: true,
      requestedCoverStartDate: nowMinusDay(),
      issuedDate: now,
      issueFacilityDetailsProvided: true,
      status: 'Submitted',
      previousFacilityStage: 'Conditional',
      issueFacilityDetailsSubmitted: true,
    },
  ],
  summary: {},
  comments: [
    {
      user: {
        username: 'MAKER',
        roles: [
          'maker',
        ],
        bank: {
          id: '9',
          name: 'UKEF test bank (Delegated)',
          emails: [
            'maker@ukexportfinance.gov.uk',
            'checker@ukexportfinance.gov.uk',
          ],
        },
        lastLogin: '1598276454940',
        firstname: 'Hugo',
        surname: 'Drax',
        email: 'maker@ukexportfinance.gov.uk',
        timezone: 'Europe/London',
        'user-status': 'active',
      },
      timestamp: '1598276463161',
      text: 'Issued facilities',
    },
    {
      user: {
        username: 'MAKER',
        roles: [
          'maker',
        ],
        bank: {
          id: '9',
          name: 'UKEF test bank (Delegated)',
          emails: [
            'maker@ukexportfinance.gov.uk',
            'checker@ukexportfinance.gov.uk',
          ],
        },
        lastLogin: '1597911455834',
        firstname: 'Hugo',
        surname: 'Drax',
        email: 'maker@ukexportfinance.gov.uk',
        timezone: 'Europe/London',
        'user-status': 'active',
      },
      timestamp: '1597912832819',
      text: 'test',
    },
    {
      user: {
        username: 'CHECKER',
        roles: [
          'checker',
        ],
        bank: {
          id: '9',
          name: 'UKEF test bank (Delegated)',
          emails: [
            'maker@ukexportfinance.gov.uk',
            'checker@ukexportfinance.gov.uk',
          ],
        },
        lastLogin: '1597912650103',
        firstname: 'Emilio',
        surname: 'Largo',
        email: 'checker@ukexportfinance.gov.uk',
        timezone: 'Europe/London',
        'user-status': 'active',
      },
      timestamp: '1597912805016',
      text: 'sdfaf',
    },
    {
      user: {
        username: 'MAKER',
        roles: [
          'maker',
        ],
        bank: {
          id: '9',
          name: 'UKEF test bank (Delegated)',
          emails: [
            'maker@ukexportfinance.gov.uk',
            'checker@ukexportfinance.gov.uk',
          ],
        },
        lastLogin: '1597911455834',
        firstname: 'Hugo',
        surname: 'Drax',
        email: 'maker@ukexportfinance.gov.uk',
        timezone: 'Europe/London',
        'user-status': 'active',
      },
      timestamp: '1597912636542',
      text: 'test',
    },
  ],
  editedBy: [],
  mandatoryCriteria: [
    {
      id: '1',
      title: 'Supply contract/Transaction',
      items: [
        {
          id: 1,
          copy: 'The Supplier has provided the Bank with a duly completed Supplier Declaration, and the Bank is not aware that any of the information contained within it is inaccurate.',
        },
        {
          id: 2,
          copy: 'The Bank has complied with its policies and procedures in relation to the Transaction.',
        },
        {
          id: 3,
          copy: 'Where the Supplier is a UK Supplier, the Supplier has provided the Bank with a duly completed UK Supplier Declaration, and the Bank is not aware that any of the information contained within it is inaccurate. (Conditional for UK Supplier)',
        },
      ],
    },
    {
      id: '2',
      title: 'Financial',
      items: [
        {
          id: 4,
          copy: 'The Bank Customer (to include both the Supplier and any Parent Obligor) is an <a href="/financial_difficulty_model_1.1.0.xlsx" class="govuk-link">Eligible Person spreadsheet</a>',
        },
      ],
    },
    {
      id: '3',
      title: 'Credit',
      items: [
        {
          id: 5,
          copy: 'The Bank Customer (to include both the Supplier and any UK Parent Obligor) has a one- year probability of default of less than 14.1%.',
        },
      ],
    },
    {
      id: '4',
      title: 'Bank Facility Letter',
      items: [
        {
          id: 6,
          copy: 'The Bank Facility Letter is governed by the laws of England and Wales, Scotland or Northern Ireland.',
        },
      ],
    },
    {
      id: '5',
      title: 'Legal',
      items: [
        {
          id: 7,
          copy: 'The Bank is the sole and beneficial owner of, and has legal title to, the Transaction.',
        },
        {
          id: 8,
          copy: 'The Bank has not made a Disposal (other than a Permitted Disposal) or a Risk Transfer (other than a Permitted Risk Transfer) in relation to the Transaction.',
        },
        {
          id: 9,
          copy: 'The Bank’s right, title and interest in relation to the Transaction is clear of any Security and Quasi-Security (other than Permitted Security) and is freely assignable without the need to obtain consent of any Obligor or any other person.',
        },
        {
          id: 10,
          copy: 'The Bank is not restricted or prevented by any agreement with an Obligor from providing information and records relating to the Transaction.',
        },
      ],
    },
  ],
  dealFiles: {
    validationErrors: {
      count: 0,
      errorList: {
        exporterQuestionnaire: {},
      },
    },
    exporterQuestionnaire: [
      {
        type: 'general_correspondence',
        fullPath: 'private-files/ukef_portal_storage/1000324/questionnaire.pdf',
        filename: 'questionnaire.pdf',
        mimetype: 'application/pdf',
      },
    ],
    security: '',
  },
};

module.exports = deal;
