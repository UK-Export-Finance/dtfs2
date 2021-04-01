const defaultSchedule = '*/10 * * * * *';
const schedule = process.env.AZURE_ACBS_FUNCTION_SCHEDULE || defaultSchedule;

const acbsController = require('../../v1/controllers/acbs.controller');

const checkAzureAcbsFunction = {
  init: () => ({
    schedule,
    message: 'Check Azure ACBS Function messages',
    task: async () => {
      await acbsController.checkAzureAcbsFunction();
    },
  }),
};

module.exports = checkAzureAcbsFunction;
