/*
 * This function is not intended to be invoked directly. Instead it will be
 * triggered by an orchestrator function.
 *
 * Before running this sample, please:
 * - create a Durable orchestration function
 * - create a Durable HTTP starter function
 *  * - run 'npm install durable-functions' from the wwwroot folder of your
 *   function app in Kudu
 */
const mdm = require('../apim-mdm');
const CONSTANTS = require('../constants');

const getAcbsCountryCode = async (context) => {
  try {
    const { country } = context.bindingData;
    const { status, data } = await mdm.getACBSCountryCode(country);
    return status === 200 && data.length > 1 ? data[0].isoCode : CONSTANTS.DEAL.COUNTRY.DEFAULT;
  } catch (error) {
    console.error('Error getting ACBS country code %o', error);
    throw new Error('Error getting ACBS country code', { cause: error });
  }
};

module.exports = getAcbsCountryCode;
