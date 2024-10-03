const df = require('durable-functions');
const { HttpStatusCode } = require('axios');
const mdm = require('../../apim-mdm');
const CONSTANTS = require('../../constants');

/**
 * Retrieves the ACBS industry sector for a given industry.
 *
 * This function sends a request to the MDM API to get the ACBS industry sector.
 * If the API request is successful and data is returned, it returns the `acbsIndustryId` of the first data object.
 * If the API request is not successful or no data is returned, it returns the default ACBS code.
 * If any error occurs during the process, it logs the error and returns the default ACBS code.
 *
 * @param {string} industry - The industry for which to get the ACBS industry sector.
 * @returns {string} - The `acbsIndustryId` of the first data object if the API request is successful and data is returned, otherwise the default ACBS code.
 * @throws {Error} - Logs the error if any error occurs during the process.
 */
const handler = async (country) => {
  try {
    const { status, data } = await mdm.getACBSCountryCode(country);

    // Check if the request was successful and data was returned
    if (status === HttpStatusCode.Ok && data?.length) {
      return data[0].isoCode;
    }

    return CONSTANTS.DEAL.COUNTRY.DEFAULT;
  } catch (error) {
    console.error(`Failed to get ACBS country code for country %s %o`, country, error);
    return CONSTANTS.DEAL.COUNTRY.DEFAULT;
  }
};

df.app.activity('get-acbs-country-code', {
  handler,
});
