const { mandatoryCriteria, ELIGIBILITY_COMPLETED, SUBMISSION_DETAILS } = require('../../../../../../e2e-fixtures');

const deal = {
  submissionType: 'Manual Inclusion Application',
  updatedAt: Date.now(),
  bankInternalRefName: 'test',
  additionalRefName: 'testing',
  status: "Ready for Checker's approval",
  previousStatus: 'Draft',
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
    lastLogin: '1597782864959',
    firstname: 'Hugo',
    surname: 'Drax',
    email: 'maker@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    'user-status': 'active',
  },
  details: {
    created: new Date().valueOf(),
  },
  eligibility: ELIGIBILITY_COMPLETED,
  submissionDetails: SUBMISSION_DETAILS,
  mockFacilities: [
    {
      type: 'Bond',
      facilityStage: 'Unissued',
      hasBeenIssued: false,
      ukefGuaranteeInMonths: '12',
      value: '1234.00',
      currencySameAsSupplyContractCurrency: 'true',
      createdDate: Date.now(),
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
    },
    {
      type: 'Loan',
      createdDate: Date.now(),
      facilityStage: 'Conditional',
      hasBeenIssued: false,
      ukefGuaranteeInMonths: '12',
      name: '',
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
    },
  ],
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
  mandatoryCriteria,
};

module.exports = deal;
