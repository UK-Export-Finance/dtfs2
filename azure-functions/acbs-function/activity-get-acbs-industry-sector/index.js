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
const df = require('durable-functions');
const mdm = require('../apim-mdm');

const getAcbsIndustrySector = async (context) => {
  try {
    const { industry } = context.bindingData;
    const { status, data } = await mdm.getACBSIndustrySector(industry);
    // ACBS Industry code `1001` = Information and communication
    return status === 200 && data.length > 0 ? data[0].acbsIndustryId : '1001';
  } catch (error) {
    console.error('Error getting ACBS industry sector: %o', error);
    throw new Error(`Error getting ACBS industry sector ${error}`);
  }
};

df.app.activity('get-acbs-industry-sector', {
  handler: getAcbsIndustrySector,
});
