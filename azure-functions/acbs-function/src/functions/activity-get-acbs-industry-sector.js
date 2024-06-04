/**
 * This function is an Azure Durable activity function.
 * This function cannot be invoked directly and is rather executed by an Azure durable orchestrator
 * function.
 *
 * @module get-acbs-industry-sector
 */

const df = require('durable-functions');
const { HttpStatusCode } = require('axios');
const { INDUSTRY } = require('../../constants');
const mdm = require('../../apim-mdm');

/**
 * Azure Durable activity function handler to get the ACBS industry sector code.
 *
 * This activity function takes an industry code as input and queries the MDM service
 * to retrieve the corresponding ACBS industry sector code. If the query is successful
 * and data is returned, it extracts and returns the ACBS industry ID from the response.
 * If the query fails or no data is returned, it defaults to returning the ACBS industry
 * ID for "Information and communication", which is '1001'.
 *
 * @param {string} industry - The industry code for which the ACBS industry sector code is required.
 * @returns {Promise<string>} - A promise that resolves to the ACBS industry sector code.
 */
df.app.activity('get-acbs-industry-sector', {
  handler: async (industry) => {
    try {
      const { status, data } = await mdm.getACBSIndustrySector(industry);

      // Check if the request was successful and data was returned
      if (status === HttpStatusCode.Ok && !data?.length) {
        return data[0].acbsIndustryId;
      }

      return INDUSTRY.DEFAULT.ACBS.CODE;
    } catch (error) {
      console.error(`Failed to get ACBS industry sector for industry %s %s`, industry, error);
      return INDUSTRY.DEFAULT.ACBS.CODE;
    }
  },
});
