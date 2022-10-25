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
    submissionDate: fourMonthsPast(),
  },
  mockFacilities: [
    {
      type: 'Bond',
      createdDate: fourMonthsPast(),
      facilityStage: CONSTANTS.FACILITY.FACILITY_STAGE.UNISSUED,
      hasBeenIssued: false,
      name: '1234',
      status: CONSTANTS.DEALS.SECTION_STATUS.COMPLETED,
    },
    {
      type: 'Loan',
      createdDate: fourMonthsPast(),
      facilityStage: CONSTANTS.FACILITY.FACILITY_STAGE.CONDITIONAL,
      hasBeenIssued: false,
      name: '5678',
      disbursementAmount: '1,234.00',
      status: CONSTANTS.DEALS.SECTION_STATUS.COMPLETED,
    },
  ],
};

module.exports = AINDeal;
