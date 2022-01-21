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
const mdmEaApi = require('../api-ukef-mdm-ea');
const CONSTANTS = require('../constants');

const getAcbsCountryCode = async (context) => {
  const { country } = context.bindingData;
  const { status, data } = await mdmEaApi.getACBSCountryCode(country);
  return (status === 200 && data.length > 1) ? data[0].isoCode : CONSTANTS.DEAL.COUNTRY.DEFAULT;
};

module.exports = getAcbsCountryCode;
