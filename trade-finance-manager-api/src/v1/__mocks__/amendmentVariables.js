const CONSTANTS = require('../../constants');

const approvedWithoutConditionsBothAmendments = {
  user: {
    firstname: 'Bob',
    surname: 'Smith',
    email: 'test@test.com',
  },
  dealSnapshot: {
    ukefDealId: '3333',
    exporter: {
      companyName: 'Tester',
    },
    bankInternalRefName: 'UKEF',
  },
  amendment: {
    ukefDecision: {
      value: CONSTANTS.DEALS.AMENDMENT_UW_DECISION.APPROVED_WITHOUT_CONDITIONS,
      coverEndDate: CONSTANTS.DEALS.AMENDMENT_UW_DECISION.APPROVED_WITHOUT_CONDITIONS,
      managersDecisionEmail: true,
    },
    ukefFacilityId: '4444',
  },
  facilityId: '1111',
  amendmentId: '2222',
};

const approvedWithoutConditionsOneAmendment = {
  ...approvedWithoutConditionsBothAmendments,
  amendment: {
    ukefDecision: {
      value: CONSTANTS.DEALS.AMENDMENT_UW_DECISION.APPROVED_WITHOUT_CONDITIONS,
      managersDecisionEmail: true,
    },
    ukefFacilityId: '4444',
  },
};

const approvedWithConditionsBothAmendments = {
  ...approvedWithoutConditionsBothAmendments,
  amendment: {
    ukefDecision: {
      value: CONSTANTS.DEALS.AMENDMENT_UW_DECISION.APPROVED_WITH_CONDITIONS,
      coverEndDate: CONSTANTS.DEALS.AMENDMENT_UW_DECISION.APPROVED_WITH_CONDITIONS,
      managersDecisionEmail: true,
      conditions: 'ABCD',
    },
    ukefFacilityId: '4444',
  },
};

const approvedWithConditionsOneAmendment = {
  ...approvedWithoutConditionsBothAmendments,
  amendment: {
    ukefDecision: {
      value: CONSTANTS.DEALS.AMENDMENT_UW_DECISION.APPROVED_WITH_CONDITIONS,
      managersDecisionEmail: true,
      conditions: 'ABCD',
    },
    ukefFacilityId: '4444',
  },
};

const approvedWithWithoutConditionsBothAmendments = {
  ...approvedWithoutConditionsBothAmendments,
  amendment: {
    ukefDecision: {
      value: CONSTANTS.DEALS.AMENDMENT_UW_DECISION.APPROVED_WITH_CONDITIONS,
      coverEndDate: CONSTANTS.DEALS.AMENDMENT_UW_DECISION.APPROVED_WITH_CONDITIONS,
      managersDecisionEmail: true,
      conditions: 'ABCD',
    },
    ukefFacilityId: '4444',
  },
};

const approvedWithConditionsDeclined = {
  ...approvedWithoutConditionsBothAmendments,
  amendment: {
    ukefDecision: {
      value: CONSTANTS.DEALS.AMENDMENT_UW_DECISION.APPROVED_WITH_CONDITIONS,
      coverEndDate: CONSTANTS.DEALS.AMENDMENT_UW_DECISION.DECLINED,
      managersDecisionEmail: true,
      conditions: 'ABCD',
      declined: 'EFGH',
    },
    ukefFacilityId: '4444',
  },
};

const approvedWithConditionsDeclinedSwapped = {
  ...approvedWithoutConditionsBothAmendments,
  amendment: {
    ukefDecision: {
      value: CONSTANTS.DEALS.AMENDMENT_UW_DECISION.DECLINED,
      coverEndDate: CONSTANTS.DEALS.AMENDMENT_UW_DECISION.APPROVED_WITH_CONDITIONS,
      managersDecisionEmail: true,
      conditions: 'ABCD',
      declined: 'EFGH',
    },
    ukefFacilityId: '4444',
  },
};

const approvedWithoutConditionsDeclined = {
  ...approvedWithoutConditionsBothAmendments,
  amendment: {
    ukefDecision: {
      value: CONSTANTS.DEALS.AMENDMENT_UW_DECISION.APPROVED_WITHOUT_CONDITIONS,
      coverEndDate: CONSTANTS.DEALS.AMENDMENT_UW_DECISION.DECLINED,
      managersDecisionEmail: true,
      declined: 'EFGH',
    },
    ukefFacilityId: '4444',
  },
};

const approvedWithoutConditionsDeclinedSwapped = {
  ...approvedWithoutConditionsBothAmendments,
  amendment: {
    ukefDecision: {
      value: CONSTANTS.DEALS.AMENDMENT_UW_DECISION.DECLINED,
      coverEndDate: CONSTANTS.DEALS.AMENDMENT_UW_DECISION.APPROVED_WITHOUT_CONDITIONS,
      managersDecisionEmail: true,
      declined: 'EFGH',
    },
    ukefFacilityId: '4444',
  },
};

const declinedBothAmendments = {
  ...approvedWithoutConditionsBothAmendments,
  amendment: {
    ukefDecision: {
      value: CONSTANTS.DEALS.AMENDMENT_UW_DECISION.DECLINED,
      coverEndDate: CONSTANTS.DEALS.AMENDMENT_UW_DECISION.DECLINED,
      managersDecisionEmail: true,
      declined: 'EFGH',
    },
    ukefFacilityId: '4444',
  },
};

const declinedOneAmendment = {
  ...approvedWithoutConditionsBothAmendments,
  amendment: {
    ukefDecision: {
      value: CONSTANTS.DEALS.AMENDMENT_UW_DECISION.DECLINED,
      managersDecisionEmail: true,
      declined: 'EFGH',
    },
    ukefFacilityId: '4444',
  },
};

const wrongAmendments = {
  ...approvedWithoutConditionsBothAmendments,
  amendment: {
    ukefDecision: {
      value: 'test',
      coverEndDate: 'test',
      managersDecisionEmail: true,
      declined: 'EFGH',
    },
    ukefFacilityId: '4444',
  },
};

module.exports = {
  approvedWithoutConditionsBothAmendments,
  approvedWithoutConditionsOneAmendment,
  approvedWithConditionsBothAmendments,
  approvedWithConditionsOneAmendment,
  approvedWithWithoutConditionsBothAmendments,
  approvedWithConditionsDeclined,
  approvedWithConditionsDeclinedSwapped,
  approvedWithoutConditionsDeclined,
  approvedWithoutConditionsDeclinedSwapped,
  declinedBothAmendments,
  declinedOneAmendment,
  wrongAmendments,
};
