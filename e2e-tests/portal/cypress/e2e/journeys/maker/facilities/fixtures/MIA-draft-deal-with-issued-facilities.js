const { mandatoryCriteria, ELIGIBILITY_COMPLETED, SUBMISSION_DETAILS } = require('../../../../../../../e2e-fixtures');
const { nowPlusMonths } = require('../../../../../support/utils/dateFuncs');

const now = new Date().valueOf();
const nowPlusMonth = nowPlusMonths(1);

const deal = {
  submissionType: 'Manual Inclusion Application',
  updatedAt: Date.now(),
  bankInternalRefName: 'TEST-DEAL',
  additionalRefName: 'TEST-DEAL',
  status: 'Draft',
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
    lastLogin: now,
    firstname: 'Hugo',
    surname: 'Drax',
    email: 'maker@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    'user-status': 'active',
  },
  details: {
    created: now,
  },
  eligibility: ELIGIBILITY_COMPLETED,
  submissionDetails: SUBMISSION_DETAILS,
  mockFacilities: [
    {
      type: 'Bond',
      createdDate: now,
      bondIssuer: '',
      bondType: 'Advance payment guarantee',
      facilityStage: 'Issued',
      hasBeenIssued: true,
      'requestedCoverStartDate-day': '',
      'requestedCoverStartDate-month': '',
      'requestedCoverStartDate-year': '',
      'coverEndDate-day': (nowPlusMonth.getDate()).toString(),
      'coverEndDate-month': (nowPlusMonth.getMonth() + 1).toString(),
      'coverEndDate-year': (nowPlusMonth.getFullYear()).toString(),
      name: '1234',
      bondBeneficiary: '',
      guaranteeFeePayableByBank: '10.8000',
      updatedAt: Date.now(),
      value: '1234.00',
      currencySameAsSupplyContractCurrency: 'true',
      riskMarginFee: '12',
      coveredPercentage: '24',
      minimumRiskMarginFee: '',
      ukefExposure: '296.16',
      feeType: 'At maturity',
      dayCountBasis: '365',
      currency: {
        text: 'GBP - UK Sterling',
        id: 'GBP',
      },
    },
    {
      type: 'Loan',
      createdDate: now,
      facilityStage: 'Unconditional',
      hasBeenIssued: true,
      'requestedCoverStartDate-day': '',
      'requestedCoverStartDate-month': '',
      'requestedCoverStartDate-year': '',
      'coverEndDate-day': (nowPlusMonth.getDate()).toString(),
      'coverEndDate-month': (nowPlusMonth.getMonth() + 1).toString(),
      'coverEndDate-year': (nowPlusMonth.getFullYear()).toString(),
      name: '1234',
      guaranteeFeePayableByBank: '21.6000',
      updatedAt: Date.now(),
      value: '1234.00',
      currencySameAsSupplyContractCurrency: 'true',
      disbursementAmount: '12.00',
      interestMarginFee: '24',
      coveredPercentage: '48',
      minimumQuarterlyFee: '',
      ukefExposure: '592.32',
      premiumType: 'At maturity',
      dayCountBasis: '365',
      currency: {
        text: 'GBP - UK Sterling',
        id: 'GBP',
      },
    },
  ],
  mandatoryCriteria,
};

module.exports = deal;
