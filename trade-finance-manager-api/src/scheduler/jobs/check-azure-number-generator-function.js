const defaultSchedule = '*/5 * * * * *';
const schedule = process.env.AZURE_NUMBER_GENERATOR_FUNCTION_SCHEDULE || defaultSchedule;

const numberGeneratorController = require('../../v1/controllers/number-generator.controller');

const checkAzureNumberGeneratorFunction = {
  init: () => ({
    schedule,
    message: 'Check Azure Number Generator Function messages',
    task: async () => {
      await numberGeneratorController.checkAzureNumberGeneratorFunction();
    },
  }),
};

module.exports = checkAzureNumberGeneratorFunction;
