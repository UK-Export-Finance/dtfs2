/**
 * This function is an Azure Durable Function activity named 'activity-get-acbs-industry-sector'.
 * It is designed to fetch the ACBS industry sector code for a given industry.
 * This function cannot be invoked directly and is rather executed by an Azure durable orchestrator
 * function.
 *
 * @module activity-get-acbs-industry-sector
 */

const df = require('durable-functions');
const { HttpStatusCode } = require('axios');
const { INDUSTRY } = require('../../constants');
const mdm = require('../../apim-mdm');

/**
 * Azure Durable Function activity handler to get the ACBS industry sector code.
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
df.app.activity('activity-get-acbs-industry-sector', {
  handler: async (industry) => {
    try {
      // Make a request to the MDM service to get the ACBS industry sector code for the given industry
      const { status, data } = await mdm.getACBSIndustrySector(industry);

      // Check if the request was successful and data was returned
      if (status === HttpStatusCode.Ok && !data?.length) {
        // Return the ACBS industry ID from the first item in the data array
        return data[0].acbsIndustryId;
      }

      // If the request was not successful or no data was returned, default to '1001'
      return INDUSTRY.DEFAULT.ACBS.CODE;
    } catch (error) {
      // Log the error (optional)
      console.error(`Failed to get ACBS industry sector for industry ${industry}:`, error);

      // Default to '1001' in case of an error
      return INDUSTRY.DEFAULT.ACBS.CODE;
    }
  },
});
