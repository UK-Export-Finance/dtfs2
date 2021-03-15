const TASKS = {
  AIN: [
    {
      // TODO: taskId, _id, id ? Object id?
      id: '1',
      title: 'Match or create the parties in this deal',
      // TODO: get full team object from db
      team: {
        id: 'UNDERWRITING_SUPPORT',
        name: 'Underwriting support',
      },
      status: 'To do',
    },
    {
      id: '2',
      title: 'Create or link this opportunity in Salesforce',
      // TODO: get full team object from db
      team: {
        id: 'UNDERWRITING_SUPPORT',
        name: 'Underwriting support',
      },
      status: 'To do',
    },
  ],
};

module.exports = {
  TASKS,
};
