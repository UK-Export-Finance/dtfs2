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

const getAcbsIndustrySector = async (context) => {
  const { industry } = context.bindingData;
  const { status, data } = await mdmEaApi.getACBSIndustrySector(industry);
  // ACBS Industry code `1001` = Information and communication
  return (status === 200 && data.length > 0) ? data[0].acbsIndustryId : '1001';
};

module.exports = getAcbsIndustrySector;
