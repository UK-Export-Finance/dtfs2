const { DEALS: { AMENDMENT_UW_DECISION } } = require('../../constants');

const ukefDealId = '3333';
const ukefFacilityId = '4444';
const facilityId = '1111';
const amendmentId = '2222';
const conditions = 'ABCD';
const declined = 'EFGH';

const approvedWithoutConditionsBothAmendments = {
  user: {
    firstname: 'Bob',
    surname: 'Smith',
    email: 'test@test.com',
  },
  dealSnapshot: {
    ukefDealId,
    exporter: {
      companyName: 'Tester',
    },
    bankInternalRefName: 'UKEF',
  },
  amendment: {
    ukefDecision: {
      value: AMENDMENT_UW_DECISION.APPROVED_WITHOUT_CONDITIONS,
      coverEndDate: AMENDMENT_UW_DECISION.APPROVED_WITHOUT_CONDITIONS,
      managersDecisionEmail: true,
    },
    ukefFacilityId,
  },
  facilityId,
  amendmentId,
};

const approvedWithoutConditionsOneAmendment = {
  ...approvedWithoutConditionsBothAmendments,
  amendment: {
    ukefDecision: {
      value: AMENDMENT_UW_DECISION.APPROVED_WITHOUT_CONDITIONS,
      managersDecisionEmail: true,
    },
    ukefFacilityId,
  },
};

const approvedWithConditionsBothAmendments = {
  ...approvedWithoutConditionsBothAmendments,
  amendment: {
    ukefDecision: {
      value: AMENDMENT_UW_DECISION.APPROVED_WITH_CONDITIONS,
      coverEndDate: AMENDMENT_UW_DECISION.APPROVED_WITH_CONDITIONS,
      managersDecisionEmail: true,
      conditions,
    },
    ukefFacilityId,
  },
};

const approvedWithConditionsOneAmendment = {
  ...approvedWithoutConditionsBothAmendments,
  amendment: {
    ukefDecision: {
      value: AMENDMENT_UW_DECISION.APPROVED_WITH_CONDITIONS,
      managersDecisionEmail: true,
      conditions,
    },
    ukefFacilityId,
  },
};

const approvedWithWithoutConditionsBothAmendments = {
  ...approvedWithoutConditionsBothAmendments,
  amendment: {
    ukefDecision: {
      value: AMENDMENT_UW_DECISION.APPROVED_WITH_CONDITIONS,
      coverEndDate: AMENDMENT_UW_DECISION.APPROVED_WITH_CONDITIONS,
      managersDecisionEmail: true,
      conditions,
    },
    ukefFacilityId,
  },
};

const approvedWithConditionsDeclined = {
  ...approvedWithoutConditionsBothAmendments,
  amendment: {
    ukefDecision: {
      value: AMENDMENT_UW_DECISION.APPROVED_WITH_CONDITIONS,
      coverEndDate: AMENDMENT_UW_DECISION.DECLINED,
      managersDecisionEmail: true,
      conditions,
      declined,
    },
    ukefFacilityId,
  },
};

const approvedWithConditionsDeclinedSwapped = {
  ...approvedWithoutConditionsBothAmendments,
  amendment: {
    ukefDecision: {
      value: AMENDMENT_UW_DECISION.DECLINED,
      coverEndDate: AMENDMENT_UW_DECISION.APPROVED_WITH_CONDITIONS,
      managersDecisionEmail: true,
      conditions,
      declined,
    },
    ukefFacilityId,
  },
};

const approvedWithoutConditionsDeclined = {
  ...approvedWithoutConditionsBothAmendments,
  amendment: {
    ukefDecision: {
      value: AMENDMENT_UW_DECISION.APPROVED_WITHOUT_CONDITIONS,
      coverEndDate: AMENDMENT_UW_DECISION.DECLINED,
      managersDecisionEmail: true,
      declined,
    },
    ukefFacilityId,
  },
};

const approvedWithoutConditionsDeclinedSwapped = {
  ...approvedWithoutConditionsBothAmendments,
  amendment: {
    ukefDecision: {
      value: AMENDMENT_UW_DECISION.DECLINED,
      coverEndDate: AMENDMENT_UW_DECISION.APPROVED_WITHOUT_CONDITIONS,
      managersDecisionEmail: true,
      declined,
    },
    ukefFacilityId,
  },
};

const declinedBothAmendments = {
  ...approvedWithoutConditionsBothAmendments,
  amendment: {
    ukefDecision: {
      value: AMENDMENT_UW_DECISION.DECLINED,
      coverEndDate: AMENDMENT_UW_DECISION.DECLINED,
      managersDecisionEmail: true,
      declined,
    },
    ukefFacilityId,
  },
};

const declinedOneAmendment = {
  ...approvedWithoutConditionsBothAmendments,
  amendment: {
    ukefDecision: {
      value: AMENDMENT_UW_DECISION.DECLINED,
      managersDecisionEmail: true,
      declined,
    },
    ukefFacilityId,
  },
};

// wrong amendment as has wrong values for value and coverEndDate
const wrongAmendments = {
  ...approvedWithoutConditionsBothAmendments,
  amendment: {
    ukefDecision: {
      value: 'test',
      coverEndDate: 'test',
      managersDecisionEmail: true,
      declined,
    },
    ukefFacilityId,
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
