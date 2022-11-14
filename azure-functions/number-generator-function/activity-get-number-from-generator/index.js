/* eslint-disable no-await-in-loop */
/*
 * This function is not intended to be invoked directly. Instead it will be
 * triggered by an orchestrator function.
 *
 */
const numberGeneratorController = require('../controllers/number-generator.controller');
const api = require('../api');

const CONSTANTS = require('../constants');

const MAX_NUMBER_OF_TRIES = 5;

const getNumberFromGenerator = async (context) => {
  const { entityType } = context.bindingData;
  console.log('===NG=1', entityType);
  let numberIsAvailable = false;
  let numberFromGenerator;
  let loopCount = 0;

  let numberType;
  let checkAcbs;

  switch (entityType) {
    case CONSTANTS.NUMBER_GENERATOR.ENTITY_TYPE.DEAL:
      numberType = CONSTANTS.NUMBER_GENERATOR.NUMBER_TYPE.DEAL;
      checkAcbs = api.checkDealId;
      break;
    case CONSTANTS.NUMBER_GENERATOR.ENTITY_TYPE.FACILITY:
      numberType = CONSTANTS.NUMBER_GENERATOR.NUMBER_TYPE.FACILITY;
      checkAcbs = api.checkFacilityId;
      break;
    default:
      throw new Error(JSON.stringify(`Invalid entityType: ${entityType}`));
  }

  // Set the maximum number of tries in case acbsCheck is unavailable and it gets stuck in an infinite loop
  while (!numberIsAvailable && loopCount < MAX_NUMBER_OF_TRIES) {
    console.info('Azure functions - getNumberFromGenerator - trying. Count ', loopCount);

    numberFromGenerator = await numberGeneratorController.callNumberGenerator(numberType);
    console.info('Azure functions - numberFromGenerator ', numberFromGenerator);


    if (numberFromGenerator.error) {
      throw new Error(JSON.stringify(numberFromGenerator.error));
    }

    const { status } = await checkAcbs(numberFromGenerator);
    // numberIsAvailable = (status === 404);
    loopCount += 1;
    console.log('===NG=2', status, loopCount, MAX_NUMBER_OF_TRIES);
  }

  return {
    ukefId: numberFromGenerator,
  };
};


module.exports = getNumberFromGenerator;
