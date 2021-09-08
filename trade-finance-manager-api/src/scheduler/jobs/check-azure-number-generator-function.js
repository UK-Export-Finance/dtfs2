// const defaultSchedule = '*/5 * * * * *';
const dotenv = require('dotenv');

dotenv.config();

const schedule = process.env.AZURE_NUMBER_GENERATOR_FUNCTION_SCHEDULE;
console.log({ schedule, env: process.env });
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
