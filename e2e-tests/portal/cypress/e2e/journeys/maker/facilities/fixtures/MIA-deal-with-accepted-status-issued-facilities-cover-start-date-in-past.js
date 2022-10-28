const { mandatoryCriteria, ELIGIBILITY_COMPLETED, SUBMISSION_DETAILS } = require('../../../../../../../e2e-fixtures');

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
    manualInclusionApplicationSubmissionDate: now,
  },
  eligibility: ELIGIBILITY_COMPLETED,
  submissionDetails: SUBMISSION_DETAILS,
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
