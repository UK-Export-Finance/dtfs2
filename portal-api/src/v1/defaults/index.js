const CONSTANTS = require('../../constants');

const DEFAULTS = {
  DEAL: {
    dealType: CONSTANTS.DEAL.DEAL_TYPE.BSS_EWCS,
    status: 'Draft',
    eligibility: {
      status: 'Not started',
    },
    submissionDetails: {
      status: 'Not started',
    },
    bondTransactions: {
      items: [],
    },
    loanTransactions: {
      items: [],
    },
    summary: {},
    comments: [],
    editedBy: [],
    facilities: [],
    exporter: {},
    supportingInformation: {
      securityDetails: {
        exporter: null,
      }
    }
  },
};

module.exports = DEFAULTS;
