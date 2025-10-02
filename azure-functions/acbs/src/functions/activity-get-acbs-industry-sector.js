const df = require('durable-functions');
const { HttpStatusCode } = require('axios');
const { INDUSTRY } = require('../../constants');
const mdm = require('../../apim-mdm');

/**
 * This function is used to get the ACBS industry sector for a given industry.
 * It sends a request to the mdm API to get the ACBS industry sector.
 * If the API request is successful and data is returned, it returns the acbsIndustryId of the first data object.
 * If the API request is not successful or no data is returned, it returns the default ACBS code.
 * If any error occurs during the process, it logs the error and returns the default ACBS code.
 *
 * @param {string} industry - The industry for which to get the ACBS industry sector.
 * @returns {string} - The acbsIndustryId of the first data object if the API request is successful and data is returned, otherwise the default ACBS code.
 * @throws {Error} - Logs the error if any error occurs during the process.
 */
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
