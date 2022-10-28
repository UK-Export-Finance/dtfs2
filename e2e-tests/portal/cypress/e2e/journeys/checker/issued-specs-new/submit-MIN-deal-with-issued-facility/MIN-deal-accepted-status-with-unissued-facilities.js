const { mandatoryCriteria, ELIGIBILITY_COMPLETED, SUBMISSION_DETAILS } = require('../../../../../../../e2e-fixtures');

const deal = {
  submissionType: 'Manual Inclusion Notice',
  updatedAt: Date.now(),
  bankInternalRefName: 'test',
  additionalRefName: 'testing',
  status: 'Accepted by UKEF (with conditions)',
  previousStatus: 'Submitted',
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
    lastLogin: new Date().valueOf(),
    firstname: 'Hugo',
    surname: 'Drax',
    email: 'maker@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    'user-status': 'active',
  },
  details: {
    created: new Date().valueOf(),
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
      lastLogin: '1597912650103',
      roles: [
        'checker',
      ],
      surname: 'Largo',
      timezone: 'Europe/London',
      'user-status': 'active',
      username: 'CHECKER',
    },
    submissionDate: new Date().valueOf(),
  },
  eligibility: ELIGIBILITY_COMPLETED,
  submissionDetails: SUBMISSION_DETAILS,
  mockFacilities: [
    {
      type: 'Bond',
      createdDate: new Date().valueOf(),
      bondIssuer: '',
      bondType: 'Performance bond',
      facilityStage: 'Unissued',
      hasBeenIssued: false,
      ukefGuaranteeInMonths: '12',
      bondBeneficiary: '',
      guaranteeFeePayableByBank: '18.0000',
      updatedAt: Date.now(),
      value: '51,000',
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
      status: 'Not started',
    },
    {
      type: 'Loan',
      createdDate: new Date().valueOf(),
      facilityStage: 'Conditional',
      hasBeenIssued: false,
      ukefGuaranteeInMonths: '12',
      name: '',
      guaranteeFeePayableByBank: '27.0000',
      updatedAt: Date.now(),
      value: '51,000',
      currencySameAsSupplyContractCurrency: 'true',
      interestMarginFee: '30',
      coveredPercentage: '20',
      minimumQuarterlyFee: '',
      ukefExposure: '246.80',
      premiumType: 'At maturity',
      dayCountBasis: '365',
      status: 'Not started',
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
  mandatoryCriteria,
  supportingInformation: {
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
    securityDetails: {
      exporter: '',
    },
  },
};

module.exports = deal;
