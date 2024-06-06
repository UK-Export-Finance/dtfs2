/**
 * This function is an Azure Durable activity function.
 * This function cannot be invoked directly and is rather executed by an Azure durable orchestrator
 * function.
 *
 */

const df = require('durable-functions');
const { HttpStatusCode } = require('axios');
const { INDUSTRY } = require('../../constants');
const mdm = require('../../apim-mdm');

const handler = async (industry) => {
  try {
    const { status, data } = await mdm.getACBSIndustrySector(industry);

    // Check if the request was successful and data was returned
    if (status === HttpStatusCode.Ok && data?.length) {
      return data[0].acbsIndustryId;
    }

    return INDUSTRY.DEFAULT.ACBS.CODE;
  } catch (error) {
    console.error(`Failed to get ACBS industry sector for industry %s %o`, industry, error);
    return INDUSTRY.DEFAULT.ACBS.CODE;
  }
};

df.app.activity('get-acbs-industry-sector', {
  handler,
});
