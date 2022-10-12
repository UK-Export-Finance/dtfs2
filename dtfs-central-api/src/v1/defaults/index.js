const { DEALS: { DEAL_STATUS } } = require('../../constants');

const DEFAULTS = {
  DEAL: {
    status: DEAL_STATUS.DRAFT,
    details: {},
    eligibility: {
      status: 'Not started',
      criteria: [],
    },
    submissionDetails: {
      status: 'Not started',
    },
    summary: {},
    comments: [],
    editedBy: [],
    facilities: [],
    exporter: {},
  },
  DEAL_TFM: {
  },
  FACILITY_TFM: {},
};

module.exports = DEFAULTS;
