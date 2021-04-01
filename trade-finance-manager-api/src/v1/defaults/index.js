const CONSTANTS = require('../../constants');

const TASKS = {
  AIN: [
    {
      groupTitle: CONSTANTS.TASKS.AIN.GROUP_1.GROUP_TITLE,
      groupTasks: [
        {
          id: '1',
          title: CONSTANTS.TASKS.AIN.GROUP_1.MATCH_OR_CREATE_PARTIES,
          team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
          status: CONSTANTS.TASKS.STATUS.TO_DO,
          assignedTo: {
            userId: CONSTANTS.TASKS.UNASSIGNED,
            userFullName: CONSTANTS.TASKS.UNASSIGNED,
          },
        },
        {
          id: '2',
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

const CREDIT_RATING = {
  AIN: CONSTANTS.DEALS.CREDIT_RATING.ACCEPTABLE,
};

const FACILITY_RISK_PROFILE = CONSTANTS.FACILITIES.FACILITY_RISK_PROFILE.FLAT;

const LOSS_GIVEN_DEFAULT = CONSTANTS.DEALS.LOSS_GIVEN_DEFAULT['50_PERCENT'];

module.exports = {
  TASKS,
  CREDIT_RATING,
  FACILITY_RISK_PROFILE,
  LOSS_GIVEN_DEFAULT,
};
