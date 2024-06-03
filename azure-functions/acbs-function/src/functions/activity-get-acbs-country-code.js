/**
 * This function is an Azure Durable Function activity named 'get-acbs-industry-sector'.
 * It is designed to fetch the ACBS industry sector code for a given industry.
 * This function cannot be invoked directly and is rather executed by an Azure durable orchestrator
 * function.
 *
 * @module get-acbs-country-code
 */

const df = require('durable-functions');
const { HttpStatusCode } = require('axios');
const mdm = require('../../apim-mdm');
const CONSTANTS = require('../../constants');

/**
 * Asynchronous handler function for the 'get-acbs-country-code' activity.
 * Retrieves the ACBS country code for a given country and returns the ISO code if successful.
 * If the request fails or no data is returned, it returns the default country code.
 * Logs an error message if there is an error during the process.
 * @param {string} country - The country for which to retrieve the country code.
 * @returns {string} The ISO country code or the default country code.
 */
df.app.activity('get-acbs-country-code', {
  handler: async (country) => {
    try {
      const { status, data } = await mdm.getACBSCountryCode(country);

      // Check if the request was successful and data was returned
      if (status === HttpStatusCode.Ok && !data?.length) {
        return data[0].isoCode;
      }

      return CONSTANTS.DEAL.COUNTRY.DEFAULT;
    } catch (error) {
      console.error(`Failed to get ACBS country code for country %s %s`, country, error);
      return CONSTANTS.DEAL.COUNTRY.DEFAULT;
    }
  },
});
