const deal = require('./MIA-deal-with-accepted-status-issued-facilities-cover-start-date-in-past');
const CONSTANTS = require('../../../../../fixtures/constants');

const fourMonthsPast = () => {
  const date = new Date();
  date.setMonth(date.getMonth() - 4);
  return date.valueOf();
};

const AINDeal = {
  ...deal,
  status: CONSTANTS.DEALS.DEAL_STATUS.UKEF_ACKNOWLEDGED,
  previousStatus: CONSTANTS.DEALS.DEAL_STATUS.READY_FOR_APPROVAL,
  submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.AIN,
  details: {
    createdDate: fourMonthsPast(),
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
    submissionDate: fourMonthsPast(),
  },
  mockFacilities: [
    {
      type: 'Bond',
      createdDate: fourMonthsPast(),
      bondIssuer: '',
      bondType: 'Performance bond',
      facilityStage: CONSTANTS.FACILITY.FACILITY_STAGE.UNISSUED,
      hasBeenIssued: false,
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
      name: '1234',
      status: CONSTANTS.DEALS.SECTION_STATUS.COMPLETED,
      previousFacilityStage: 'Unissued',
    },
    {
      type: 'Loan',
      createdDate: fourMonthsPast(),
      facilityStage: CONSTANTS.FACILITY.FACILITY_STAGE.CONDITIONAL,
      hasBeenIssued: false,
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
      disbursementAmount: '1,234.00',
      issueFacilityDetailsStarted: true,
      nameRequiredForIssuance: true,
      status: CONSTANTS.DEALS.SECTION_STATUS.COMPLETED,
      previousFacilityStage: 'Conditional',
    },
  ],
};

module.exports = AINDeal;
