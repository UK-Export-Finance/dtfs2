/*
 * This function is not intended to be invoked directly. Instead it will be
 * triggered by an orchestrator function.
 *
 */
const numberGeneratorController = require('../controllers/number-generator.controller');
const CONSTANTS = require('../constants');

const getNumberFromGenerator = async () => {
  const numberFromGenerator = await numberGeneratorController.callNumberGenerator(CONSTANTS.NUMBER_GENERATOR.NUMBER_TYPE.DEAL);

  if (numberFromGenerator.error) {
    throw new Error(JSON.stringify(numberFromGenerator.error));
  }
  return numberFromGenerator;
};


module.exports = getNumberFromGenerator;
