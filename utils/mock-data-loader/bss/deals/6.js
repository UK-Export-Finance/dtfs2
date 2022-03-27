const { nowTimestamp } = require('../dates');
const MANDATORY_CRITERIA = require('../mandatoryCriteria');

// de-structure and create a new array, so `sort` doesn't impact 'MANDATORY_CRITERIA'
let mandatoryCriteria = [...MANDATORY_CRITERIA].sort((a, b) => (a.version > b.version ? 1 : -1));
// get the latest mandatory criteria (sorted by version)
mandatoryCriteria = mandatoryCriteria[mandatoryCriteria.length - 1];

module.exports = {
  mockId: 6,
  dealType: 'BSS/EWCS',
  submissionType: 'Manual Inclusion Application',
  updatedAt: Date.now(),
  bankInternalRefName: 'Manual Test 4',
  additionalRefName: 'Manual Test 4',
  bank: {
    id: '9',
    name: 'UKEF test bank (Delegated)',
    emails: [
      'checker@ukexportfinance.gov.uk'
    ]
  },
  details: {
    status: 'Draft',
    maker: {
      _id: '60f7d72654f99900074c0a6d',
      username: 'maker1@ukexportfinance.gov.uk',
      roles: [
        'maker'
      ],
      bank: {
        id: '9',
        name: 'UKEF test bank (Delegated)',
        emails: [
          'checker@ukexportfinance.gov.uk'
        ]
      },
      lastLogin: '1626971784058',
      firstname: 'Hugo',
      surname: 'Drax',
      email: 'maker1@ukexportfinance.gov.uk',
      timezone: 'Europe/London',
      'user-status': 'active'
    },
    created: nowTimestamp
  },
  eligibility: {
    status: 'Incomplete',
    criteria: [
      {
        _id: '60f7d72854f99900074c0a91',
        id: 11,
        description: 'The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve agents and the Bank is not aware that any of the information contained within it is inaccurate.',
        answer: true
      },
      {
        _id: '60f7d72854f99900074c0a92',
        id: 12,
        description: 'The cover period for each Transaction does not exceed 5 years, or such other period approved by UKEF (that has not lapsed or been withdrawn) in relation to bonds and/or loans for this Obligor.',
        answer: false
      },
      {
        _id: '60f7d72854f99900074c0a93',
        id: 13,
        description: 'The total UKEF exposure, across all short-term schemes (including bond support, export working capital and general export facility transactions), for this Obligor (including this Transaction) does not exceed £5 million, or such other limit approved by UKEF (that has not lapsed or been withdrawn).',
        answer: true
      },
      {
        _id: '60f7d72854f99900074c0a94',
        id: 14,
        description: 'For a bond Transaction, the bond has not yet been issued or, where the bond has been issued, this was done no more than 3 months prior to the submission of this Inclusion Notice. For a loan Transaction, the loan has not yet been advanced.',
        answer: true
      },
      {
        _id: '60f7d72854f99900074c0a95',
        id: 15,
        description: 'The Requested Cover Start Date is no more than three months from the date of submission.',
        answer: true
      },
      {
        _id: '60f7d72854f99900074c0a96',
        id: 16,
        description: 'The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve any of the following Controlled Sectors: sharp arms defence, nuclear, radiological, biological, human cloning, pornography, tobacco, gambling, coal, oil, gas or fossil fuel energy and the Bank is not aware that any of the information contained within it is inaccurate.',
        answer: true
      },
      {
        _id: '60f7d72854f99900074c0a97',
        id: 17,
        description: 'The Bank has completed its Bank Due Diligence to its satisfaction in accordance with its policies and procedures without having to escalate to any Relevant Person.',
        answer: true
      },
      {
        _id: '60f7d72854f99900074c0a98',
        id: 18,
        description: 'The fees and/or interest apply to the whole Cover Period, and have been set in accordance with the Bank’s normal pricing policies and, if any, minimum or overall pricing requirements set by UKEF.',
        answer: true
      }
    ],
    agentName: '',
    agentAddressCountry: '',
    agentAddressLine1: '',
    agentAddressLine2: '',
    agentAddressLine3: '',
    agentAddressTown: '',
    agentAddressPostcode: '',
    validationErrors: {
      count: 0,
      errorList: {
        agentName: {
        },
        agentAddressCountry: {
        },
        agentAddressLine1: {
        },
        agentAddressPostcode: {
        },
        agentAddressTown: {
        }
      }
    }
  },
  submissionDetails: {
    status: 'Incomplete',
    'supplier-type': 'Exporter',
    'supplier-companies-house-registration-number': 'Test',
    'supplier-name': 'Manual Test 2',
    'supplier-address-country': {
      name: 'Netherlands',
      code: 'NLD'
    },
    'supplier-address-line-1': 'TEST',
    'supplier-address-line-2': 'TEST',
    'supplier-address-line-3': 'TEST',
    'supplier-address-town': 'TEST',
    'supplier-address-postcode': 'TEST',
    'supplier-correspondence-address-is-different': 'false',
    'supplier-correspondence-address-country': {
    },
    'supplier-correspondence-address-line-1': '',
    'supplier-correspondence-address-line-2': '',
    'supplier-correspondence-address-line-3': '',
    'supplier-correspondence-address-town': '',
    'supplier-correspondence-address-postcode': '',
    'industry-sector': {
      code: '1015',
      name: 'Education'
    },
    'industry-class': {
      code: '85200',
      name: 'Primary education'
    },
    'sme-type': 'Small',
    'supply-contract-description': 'Test',
    legallyDistinct: 'false',
    'indemnifier-companies-house-registration-number': '',
    'indemnifier-name': '',
    'indemnifier-address-country': {
    },
    'indemnifier-address-line-1': '',
    'indemnifier-address-line-2': '',
    'indemnifier-address-line-3': '',
    'indemnifier-address-town': '',
    'indemnifier-address-postcode': '',
    'indemnifier-correspondence-address-country': {
    },
    'indemnifier-correspondence-address-line-1': '',
    'indemnifier-correspondence-address-line-2': '',
    'indemnifier-correspondence-address-line-3': '',
    'indemnifier-correspondence-address-town': '',
    'indemnifier-correspondence-address-postcode': '',
    indemnifierCorrespondenceAddressDifferent: '',
    'buyer-name': 'Manual 1 Test',
    'buyer-address-country': {
      name: 'United Kingdom',
      code: 'GBR'
    },
    'buyer-address-line-1': 'TEST',
    'buyer-address-line-2': 'TEST',
    'buyer-address-line-3': 'TEST',
    'buyer-address-town': 'TEST',
    'buyer-address-postcode': 'TEST',
    destinationOfGoodsAndServices: {
      name: 'Netherlands',
      code: 'NLD'
    },
    supplyContractValue: '800000.00',
    supplyContractCurrency: {
      text: 'GBP - UK Sterling',
      id: 'GBP',
      currencyId: 12
    },
    supplyContractConversionRateToGBP: '',
    'supplyContractConversionDate-day': '',
    'supplyContractConversionDate-month': '',
    'supplyContractConversionDate-year': ''
  },
  summary: {
  },
  comments: [],
  editedBy: [
    {
      date: '1626972461251',
      username: 'maker1@ukexportfinance.gov.uk',
      roles: [
        'maker'
      ],
      bank: {
        id: '9',
        name: 'UKEF test bank (Delegated)',
        emails: [
          'checker@ukexportfinance.gov.uk'
        ]
      },
      userId: '60f7d72654f99900074c0a6d'
    },
  ],
  mandatoryCriteria,
  supportingInformation: {
    validationErrors: {
      count: 1,
      errorList: {
        exporterQuestionnaire: {
          order: 1,
          text: 'Manual Inclusion Questionnaire is required.'
        }
      }
    },
    securityDetails: {
      exporter: 'Test'
    },
  },
  ukefComments: [],
  ukefDecision: [],
  exporter: {
    companyName: 'Manual Test 2'
  }
};
