const { nowTimestamp } = require('../dates');

module.exports = {
  mockId: 2,
  dealType: 'BSS/EWCS',
  submissionType: 'Automatic Inclusion Notice',
  updatedAt: Date.now(),
  bankInternalRefName: 'Auto2 Test',
  additionalRefName: 'Auto Test 2',
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
      lastLogin: '1626968154830',
      firstname: 'Hugo',
      surname: 'Drax',
      email: 'maker1@ukexportfinance.gov.uk',
      timezone: 'Europe/London',
      'user-status': 'active'
    },
    created: nowTimestamp
  },
  eligibility: {
    status: 'Completed',
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
        answer: true
      },
      {
        _id: '60f7d72854f99900074c0a93',
        id: 13,
        description: 'The total UKEF exposure, across all short-term schemes (including bond support and export working capital transactions), for this Obligor (including this Transaction) does not exceed £2 million, or such other limit approved by UKEF (that has not lapsed or been withdrawn).',
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
        description: 'The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve any of the following Controlled Sectors: sharp arms defence, nuclear, radiological, biological, human cloning, pornography, tobacco or gambling, and the Bank is not aware that any of the information contained within it is inaccurate.',
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
        11: {
        },
        12: {
        },
        13: {
        },
        14: {
        },
        15: {
        },
        16: {
        },
        17: {
        },
        18: {
        },
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
    'supplier-companies-house-registration-number': 'TEST',
    'supplier-name': 'Auto Test 2',
    'supplier-address-country': {
      name: 'Australia',
      code: 'AUS'
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
      code: '1005',
      name: 'Construction'
    },
    'industry-class': {
      code: '42910',
      name: 'Construction of water projects'
    },
    'sme-type': 'Medium',
    'supply-contract-description': 'TEST',
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
    'buyer-name': 'Auto Test 2',
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
      name: 'United Arab Emirates',
      code: 'ARE'
    },
    supplyContractValue: '5000000.00',
    supplyContractCurrency: {
      text: 'GBP - UK Sterling',
      id: 'GBP',
      currencyId: 12
    },
    supplyContractConversionRateToGBP: '',
    'supplyContractConversionDate-day': '',
    'supplyContractConversionDate-month': '',
    'supplyContractConversionDate-year': '',
    viewedPreviewPage: true
  },
  summary: {
  },
  comments: [],
  editedBy: [
    {
      date: '1626969762958',
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
    {
      date: '1626969779865',
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
    {
      date: '1626969803679',
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
    {
      date: '1626969826021',
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
    {
      date: '1626969843691',
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
    {
      date: '1626969862981',
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
    {
      date: '1626969943998',
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
    {
      date: '1626969947765',
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
    {
      date: '1626969954919',
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
    {
      date: '1626969955347',
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
    {
      date: '1626970030824',
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
    {
      date: '1626970035232',
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
    {
      date: '1626970096849',
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
    {
      date: '1626970151904',
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
    {
      date: '1626970205420',
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
    {
      date: '1626970230887',
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
    {
      date: '1626971160319',
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
    {
      date: '1626971176868',
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
    {
      date: '1626971195529',
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
    {
      date: '1626971207486',
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
    {
      date: '1626971240593',
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
    {
      date: '1626971255477',
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
    {
      date: '1626971260922',
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
    {
      date: '1626971261258',
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
    {
      date: '1626971386352',
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
    }
  ],
  mandatoryCriteria: [
    {
      _id: '60f7d72854f99900074c0a8c',
      id: '1',
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
      _id: '60f7d72854f99900074c0a8d',
      id: '2',
      title: 'Financial',
      items: [
        {
          id: 4,
          copy: 'The Bank Customer (to include both the Supplier and any Parent Obligor) is an <a href="/financial_difficulty_model_1.1.0.xlsx" class="govuk-link">Eligible Person spreadsheet</a>'
        }
      ]
    },
    {
      _id: '60f7d72854f99900074c0a8e',
      id: '3',
      title: 'Credit',
      items: [
        {
          id: 5,
          copy: 'The Bank Customer (to include both the Supplier and any UK Parent Obligor) has a one- year probability of default of less than 14.1%.'
        }
      ]
    },
    {
      _id: '60f7d72854f99900074c0a8f',
      id: '4',
      title: 'Bank Facility Letter',
      items: [
        {
          id: 6,
          copy: 'The Bank Facility Letter is governed by the laws of England and Wales, Scotland or Northern Ireland.'
        }
      ]
    },
    {
      _id: '60f7d72854f99900074c0a90',
      id: '5',
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
  ],
  supportingInformation: {
    validationErrors: {
      count: 0,
      errorList: {
        exporterQuestionnaire: {
        }
      }
    },
    security: 'TEST'
  },
  ukefComments: [],
  ukefDecision: [],
  exporter: {
    companyName: 'Auto Test 2'
  }
};
