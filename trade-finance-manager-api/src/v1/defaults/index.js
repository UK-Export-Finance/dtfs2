const CONSTANTS = require('../../constants');

const TASKS = {
  AIN: [
    {
      groupTitle: CONSTANTS.TASKS.AIN.GROUP_1.GROUP_TITLE,
      id: 1,
      groupTasks: [
        {
          id: '1',
          groupId: 1,
          title: CONSTANTS.TASKS.AIN.GROUP_1.MATCH_OR_CREATE_PARTIES,
          team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
          status: CONSTANTS.TASKS.STATUS.TO_DO,
          assignedTo: {
            userId: CONSTANTS.TASKS.UNASSIGNED,
            userFullName: CONSTANTS.TASKS.UNASSIGNED,
          },
          canEdit: true,
        },
        {
          id: '2',
          groupId: 1,
          title: CONSTANTS.TASKS.AIN.GROUP_1.CREATE_OR_LINK_SALESFORCE,
          team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
          status: CONSTANTS.TASKS.STATUS.TO_DO,
          assignedTo: {
            userId: CONSTANTS.TASKS.UNASSIGNED,
            userFullName: CONSTANTS.TASKS.UNASSIGNED,
          },
        },
      ],
    },
  ],
};

const HISTORY = {
  tasks: [],
};

const CREDIT_RATING = {
  AIN: CONSTANTS.DEALS.CREDIT_RATING.ACCEPTABLE,
};

const FACILITY_RISK_PROFILE = CONSTANTS.FACILITIES.FACILITY_RISK_PROFILE.FLAT;

const LOSS_GIVEN_DEFAULT = CONSTANTS.DEALS.LOSS_GIVEN_DEFAULT['50_PERCENT'];

const PROBABILITY_OF_DEFAULT = CONSTANTS.DEALS.PROBABILITY_OF_DEFAULT.LESS_THAN_14_PERCENT;

module.exports = {
  TASKS,
  HISTORY,
  CREDIT_RATING,
  FACILITY_RISK_PROFILE,
  LOSS_GIVEN_DEFAULT,
  PROBABILITY_OF_DEFAULT,
};
