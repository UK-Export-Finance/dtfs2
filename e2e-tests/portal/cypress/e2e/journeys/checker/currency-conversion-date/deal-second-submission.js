const firstSubmission = require('./deal-first-submission');
const CONSTANTS = require('../../../../fixtures/constants');

const date = new Date();

export const secondSubmission = {
  ...firstSubmission,
  previousStatus: CONSTANTS.DEALS.DEAL_STATUS.UKEF_ACKNOWLEDGED,
  details: {
    created: date.valueOf(),
    submissionDate: date.valueOf(),
  },
};
