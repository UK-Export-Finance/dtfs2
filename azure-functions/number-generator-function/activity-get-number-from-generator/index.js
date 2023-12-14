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
  try {
    const { entityType } = context.bindingData;

    let numberIsAvailable = false;
    let number;
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
        throw new Error('Invalid entityType %s', entityType);
    }
    /**
     * Maximum tries mitigates infinite loop execution
     */
    while (!numberIsAvailable && loopCount < MAX_NUMBER_OF_TRIES) {
      console.info('⚡️ Number generator execution #%s', loopCount);

      number = await numberGeneratorController.callNumberGenerator(numberType);

      if (!number) {
        throw new Error('Void response received %s', number);
      }

      console.info('✅ %s received on attempt %d', number, loopCount);

      const { status } = await checkAcbs(number);
      numberIsAvailable = status === 404;
      loopCount += 1;
    }

    return {
      ukefId: number,
      entityType,
    };
  } catch (error) {
    console.error('Error getting number from generator %s', error);
    return false;
  }
};

module.exports = getNumberFromGenerator;
