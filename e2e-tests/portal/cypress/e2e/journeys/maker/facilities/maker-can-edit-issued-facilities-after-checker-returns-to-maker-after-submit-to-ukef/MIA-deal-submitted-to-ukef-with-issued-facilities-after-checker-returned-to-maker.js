const { mandatoryCriteria, ELIGIBILITY_COMPLETED, SUBMISSION_DETAILS } = require('../../../../../../../e2e-fixtures');
const { nowPlusMonths, nowPlusDays } = require('../../../../../support/utils/dateFuncs');

const now = new Date();
const nowPlus1Month = nowPlusMonths(1);
const nowPlus2Months = nowPlusMonths(2);
const nowPlusWeek = nowPlusDays(7).valueOf();

const deal = {
  submissionType: 'Manual Inclusion Application',
  updatedAt: Date.now(),
  bankInternalRefName: 'test',
  additionalRefName: 'testing',
  status: 'Further Maker\'s input required',
  previousStatus: 'Ready for Checker\'s approval',
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
    lastLogin: now.valueOf(),
    firstname: 'Hugo',
    surname: 'Drax',
    email: 'maker@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    'user-status': 'active',
  },
  details: {
    created: '1599048723110',
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
      lastLogin: '1599048724584',
      roles: [
        'checker',
      ],
      surname: 'Largo',
      timezone: 'Europe/London',
      'user-status': 'active',
      username: 'CHECKER',
    },
    submissionDate: now.valueOf(),
    ukefDealId: '1001349',
    approvalDate: '1599048727451',
  },
  eligibility: ELIGIBILITY_COMPLETED,
  submissionDetails: SUBMISSION_DETAILS,
  mockFacilities: [
    {
      type: 'Bond',
      facilityStage: 'Issued',
      hasBeenIssued: true,
      ukefGuaranteeInMonths: '12',
      value: '1234.00',
      currencySameAsSupplyContractCurrency: 'true',
      createdDate: 1599048722968.0,
      bondIssuer: '',
      bondType: 'Bid bond',
      bondBeneficiary: '',
      guaranteeFeePayableByBank: '10.8000',
      ukefExposure: '296.16',
      updatedAt: Date.now(),
      riskMarginFee: '12',
      coveredPercentage: '24',
      minimumRiskMarginFee: '',
      feeType: 'At maturity',
      dayCountBasis: '365',
      currency: {
        text: 'GBP - UK Sterling',
        id: 'GBP',
      },
      ukefFacilityId: [
        '12345',
      ],
      'issuedDate-day': now.getDate(),
      'issuedDate-month': now.getMonth() + 1,
      'issuedDate-year': now.getFullYear(),
      'requestedCoverStartDate-day': '',
      'requestedCoverStartDate-month': '',
      'requestedCoverStartDate-year': '',
      'coverEndDate-day': (nowPlus2Months.getDate()).toString(),
      'coverEndDate-month': (nowPlus2Months.getMonth() + 1).toString(),
      'coverEndDate-year': (nowPlus2Months.getFullYear()).toString(),
      name: '1234',
      issueFacilityDetailsStarted: true,
      nameRequiredForIssuance: true,
      requestedCoverStartDate: nowPlus1Month.valueOf(),
      issuedDate: nowPlusWeek,
      issueFacilityDetailsProvided: true,
      status: "Maker's input required",
      previousFacilityStage: 'Issued',
    },
    {
      type: 'Loan',
      createdDate: 1599048722968.0,
      facilityStage: 'Unconditional',
      hasBeenIssued: true,
      ukefGuaranteeInMonths: '12',
      name: '5678',
      guaranteeFeePayableByBank: '18.0000',
      updatedAt: Date.now(),
      value: '1234.00',
      currencySameAsSupplyContractCurrency: 'true',
      interestMarginFee: '20',
      coveredPercentage: '40',
      minimumQuarterlyFee: '',
      ukefExposure: '493.60',
      premiumType: 'At maturity',
      dayCountBasis: '365',
      ukefFacilityId: [
        '56789',
      ],
      'issuedDate-day': now.getDate(),
      'issuedDate-month': now.getMonth() + 1,
      'issuedDate-year': now.getFullYear(),
      'requestedCoverStartDate-day': '',
      'requestedCoverStartDate-month': '',
      'requestedCoverStartDate-year': '',
      'coverEndDate-day': (nowPlus2Months.getDate()).toString(),
      'coverEndDate-month': (nowPlus2Months.getMonth() + 1).toString(),
      'coverEndDate-year': (nowPlus2Months.getFullYear()).toString(),
      disbursementAmount: '1,234.00',
      issueFacilityDetailsStarted: true,
      nameRequiredForIssuance: true,
      issuedDate: nowPlusWeek,
      issueFacilityDetailsProvided: true,
      status: "Maker's input required",
      previousFacilityStage: 'Conditional',
      requestedCoverStartDate: nowPlus1Month.valueOf(),
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
        lastLogin: '1599049060901',
        firstname: 'Hugo',
        surname: 'Drax',
        email: 'maker@ukexportfinance.gov.uk',
        timezone: 'Europe/London',
        'user-status': 'active',
      },
      timestamp: '1599049985118',
      text: 'zsdf',
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
        lastLogin: '1599048724584',
        firstname: 'Emilio',
        surname: 'Largo',
        email: 'checker@ukexportfinance.gov.uk',
        timezone: 'Europe/London',
        'user-status': 'active',
      },
      timestamp: '1599048760960',
      text: 'asdfsadf',
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
        lastLogin: '1599048728874',
        firstname: 'Hugo',
        surname: 'Drax',
        email: 'maker@ukexportfinance.gov.uk',
        timezone: 'Europe/London',
        'user-status': 'active',
      },
      timestamp: '1599048733918',
      text: 'Issued a facility',
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
        lastLogin: '1597782864959',
        firstname: 'Hugo',
        surname: 'Drax',
        email: 'maker@ukexportfinance.gov.uk',
        timezone: 'Europe/London',
        'user-status': 'active',
      },
      timestamp: '1597782964434',
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
        fullPath: 'private-files/ukef_portal_storage/1001560/questionnaire.pdf',
        filename: 'questionnaire.pdf',
        mimetype: 'application/pdf',
      },
    ],
    securityDetails: {
      exporter: '',
    },
  },
  ukefComments: [
    {
      user: {
        username: 'test@test.com',
        firstname: 'UKEF',
        surname: '',
        roles: [
          'interface',
        ],
        bank: {
          id: '*',
        },
      },
      timestamp: '1599048727440',
      text: 'undefined',
    },
  ],
};

module.exports = deal;
