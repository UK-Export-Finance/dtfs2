const CONSTANTS = require('../../constants');

const TASKS = {
  AIN: [
    {
      // TODO: taskId, _id, id ? Object id?
      id: '1',
      title: CONSTANTS.TASKS.AIN.MATCH_OR_CREATE_PARTIES,
      team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
      status: CONSTANTS.TASKS.STATUS.TO_DO,
    },
    {
      id: '2',
      title: CONSTANTS.TASKS.AIN.CREATE_OR_LINK_SALESFORCE,
      team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
      status: CONSTANTS.TASKS.STATUS.TO_DO,
    },
  ],
};

module.exports = {
  TASKS,
};
