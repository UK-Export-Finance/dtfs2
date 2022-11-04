const { ELIGIBILITY_COMPLETED, SUBMISSION_DETAILS } = require('../../../../../../e2e-fixtures');
const dateConstants = require('../../../../../../e2e-fixtures/dateConstants');

const now = Date.now();
const nowFormatted = new Date();
const nowDay = (dateConstants.todayDay).toString();
const nowMonth = (dateConstants.todayMonth).toString();
const nowYear = (dateConstants.todayYear).toString();
const nowPlusMonthDay = (dateConstants.oneMonthDay).toString();
const nowPlusMonthMonth = (dateConstants.oneMonthMonth).toString();
const nowPlusMonthYear = (dateConstants.oneMonthYear).toString();

const deal = {
  submissionType: 'Automatic Inclusion Notice',
  updatedAt: now,
  bankInternalRefName: 'mock id',
  additionalRefName: 'mock name',
  status: 'Draft',
  bank: {
    id: '9',
    name: 'UKEF test bank (Delegated)',
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
      bondType: 'Bid bond',
      facilityStage: 'Unissued',
      hasBeenIssued: false,
      ukefGuaranteeInMonths: '12',
      bondBeneficiary: '',
      guaranteeFeePayableByBank: '18.0000',
      value: '21313.00',
      currencySameAsSupplyContractCurrency: 'true',
      riskMarginFee: '20',
      coveredPercentage: '30',
      minimumRiskMarginFee: '',
      ukefExposure: '6,393.90',
      feeType: 'At maturity',
      dayCountBasis: '365',
      currency: {
        text: 'GBP - UK Sterling',
        id: 'GBP',
      },
    },
    {
      type: 'Bond',
      createdDate: now,
      bondIssuer: '',
      bondType: 'Bid bond',
      facilityStage: 'Issued',
      hasBeenIssued: true,
      requestedCoverStartDate: nowFormatted.valueOf().toString(),
      'requestedCoverStartDate-day': nowDay,
      'requestedCoverStartDate-month': nowMonth,
      'requestedCoverStartDate-year': nowYear,
      'coverEndDate-day': nowPlusMonthDay,
      'coverEndDate-month': nowPlusMonthMonth,
      'coverEndDate-year': nowPlusMonthYear,
      name: '1234',
      bondBeneficiary: '',
      guaranteeFeePayableByBank: '18.0000',
      updatedAt: now,
      value: '1234.00',
      currencySameAsSupplyContractCurrency: 'true',
      riskMarginFee: '20',
      coveredPercentage: '30',
      minimumRiskMarginFee: '',
      ukefExposure: '370.20',
      feeType: 'At maturity',
      dayCountBasis: '365',
    },
    {
      type: 'Loan',
      createdDate: now,
      facilityStage: 'Conditional',
      hasBeenIssued: false,
      ukefGuaranteeInMonths: '12',
      name: '',
      guaranteeFeePayableByBank: '18.0000',
      updatedAt: now,
      value: '1234.00',
      currencySameAsSupplyContractCurrency: 'true',
      interestMarginFee: '20',
      coveredPercentage: '40',
      minimumQuarterlyFee: '',
      ukefExposure: '493.60',
      premiumType: 'At maturity',
      dayCountBasis: '365',
    },
    {
      type: 'Loan',
      createdDate: now,
      facilityStage: 'Unconditional',
      hasBeenIssued: true,
      requestedCoverStartDate: nowFormatted.valueOf().toString(),
      'requestedCoverStartDate-day': nowDay,
      'requestedCoverStartDate-month': nowMonth,
      'requestedCoverStartDate-year': nowYear,
      'coverEndDate-day': nowPlusMonthDay,
      'coverEndDate-month': nowPlusMonthMonth,
      'coverEndDate-year': nowPlusMonthYear,
      name: '12345678',
      guaranteeFeePayableByBank: '45.0000',
      updatedAt: now,
      value: '1234.00',
      currencySameAsSupplyContractCurrency: 'true',
      disbursementAmount: '200.00',
      interestMarginFee: '50',
      coveredPercentage: '60',
      minimumQuarterlyFee: '',
      ukefExposure: '740.40',
      premiumType: 'At maturity',
      dayCountBasis: '365',
    },
  ],
  supportingInformation: {
    exporterQuestionnaire: [
      {
        type: 'general_correspondence',
        fullPath: 'private-files/ukef_portal_storage/1001000/questionnaire.pdf',
        filename: 'questionnaire.pdf',
        mimetype: 'application/pdf',
      },
    ],
    securityDetails: {
      exporter: '',
    },
  },
};

export default deal;
