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
  const { industryCode } = context.bindingData;
  const { status, data } = await mdmEaApi.getACBSIndustrySector(industryCode);
  return (status === 200) ? data[0].acbsIndustryId : '0001';
};

module.exports = getAcbsIndustrySector;
